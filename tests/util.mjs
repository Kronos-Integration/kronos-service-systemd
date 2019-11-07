import execa from "execa";
import fs from "fs";

export function monitorUnit(unitName, cb) {
  let status, active, pid;

  let sysctl;
  let terminate;

  const handler = async () => {
    try {
      //const sysctl = systemctl("status",unitName);
      sysctl = execa("systemctl", ["--user", "status", unitName, '-n', '0']);
      sysctl.stderr.pipe(process.stderr);

      let changed = false;
      let buffer = "";
      for await (const chunk of sysctl.stdout) {
        buffer += chunk.toString("utf8");
        do {
          const i = buffer.indexOf("\n");
          if (i < 0) {
            break;
          }
          const line = buffer.substr(0, i);
          buffer = buffer.substr(i + 1);

          console.log(line);

          let m = line.match(/Status:\s*"([^"]+)/);
          if (m && m[1] != status) {
            changed = true;
            status = m[1];
          }
          m = line.match(/Active:\s*(\w+)/);
          if (m && m[1] != active) {
            changed = true;
            active = m[1];
          }

          m = line.match(/Main\s+PID:\s*(\d+)/);
          if (m && m[1] != pid) {
            changed = true;
            pid = parseInt(m[1]);
          }

          if (changed) {
            //console.log({ status, active, pid });
            cb({ name: unitName, status, active, pid });
            changed = false;
          }
        } while (true);
      }
      const p = await status;

      if(!terminate) {
        await handler();
      }
    } catch (e) {
      console.log(e);
    }
  };

  handler();

  return {
    terminate: () => {
      terminate = true;
      sysctl.kill();
    }
  };
}

export function clearMonitorUnit(handle) {
  handle.terminate();
}

export async function* journalctl(unitName) {
  const j = execa("journalctl", ["--user", "-u", unitName, "-f", "-o", "json"]);

  let buffer = "";
  for await (const chunk of j.stdout) {
    buffer += chunk.toString("utf8");
    do {
      const i = buffer.indexOf("\n");
      if (i < 0) {
        break;
      }

      const line = buffer.substr(0, i);
      buffer = buffer.substr(i + 1);
      const entry = JSON.parse(line);
      console.log(entry.MESSAGE);
      yield entry;
    } while (true);
  }

  return j;
}

export function systemctl(...args) {
  return execa("systemctl", ["--user", ...args]);
}

export async function wait(msecs = 1000) {
  return new Promise(resolve => setTimeout(resolve, msecs));
}

export async function writeUnitDefinition(
  serviceDefinitionFileName,
  unitName,
  wd
) {
  const which = await await execa("which", ["node"]);
  const node = which.stdout.trim();

  return fs.promises.writeFile(
    serviceDefinitionFileName,
    `[Unit]
Description=notifying service test
[Service]
Type=notify
ExecStart=${node} ${wd}/build/notify-test-cli
Environment=LOGLEVEL=trace
NotifyAccess=all
FileDescriptorStoreMax=2
RuntimeDirectory=${unitName}
StateDirectory=${unitName}
ConfigurationDirectory=${unitName}

`,
    { encoding: "utf8" }
  );
}

export async function writeSocketUnitDefinition(
  serviceDefinitionFileName,
  unitName,
  fileDescriptorName,
  socket
) {
  return fs.promises.writeFile(
    serviceDefinitionFileName,
    `[Socket]
ListenStream=${socket}
FileDescriptorName=${fileDescriptorName}
[Install]
RequiredBy=${unitName}.service
`,
    { encoding: "utf8" }
  );
}
