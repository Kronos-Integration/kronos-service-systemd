import execa from "execa";
import fs from "fs";

export function monitorUnit(unitName,cb)
{
  let status,active;

  const statusInterval = setInterval(async () => {
    status = undefined;
    active = undefined;
    try {
      //const sysctl = systemctl("status",unitName);
      const sysctl = execa("systemctl",["--user","status",unitName]);
      sysctl.stderr.pipe(process.stderr);

      sysctl.stdout.on("data", data => {
        let changed = false;
        let m = String(data).match(/Status:\s*"([^"]+)/);
        if (m && m[1] != status) {
          changed = true;
          status = m[1];
        }
        m = String(data).match(/Active:\s*(\w+)/);
        if (m && m[1] != active) {
          changed = true;
          active = m[1];
        }

	if(changed) {
          cb({name:unitName,status,active});
        }
      });

      const p = await status;
    } catch (e) {
      console.log(e);
    }
  }, 1000);

  return statusInterval;
}

export function clearMonitorUnit(handle) {
  clearInterval(handle);
}

export async function journalctl(unitName) {
  const journalctl = execa('journalctl', ['--user', '-u', unitName, '-f']);
//  journalctl.stdout.pipe(process.stdout);
  return journalctl;
}

export async function systemctl(...args) {
  const systemctl = execa("systemctl", ["--user", ...args]);
  return systemctl;
}

export async function wait(msecs = 1000) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, msecs);
  });
}

export async function writeUnitDefinition(serviceDefinitionFileName, unitName, wd) {
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

RuntimeDirectory=${unitName}
StateDirectory=${unitName}
ConfigurationDirectory=${unitName}

`,
    { encoding: "utf8" }
  );
}
