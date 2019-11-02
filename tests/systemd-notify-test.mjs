import test from "ava";
import { join } from "path";
import execa from "execa";
import fs from "fs";


async function journalctl(unitName) {
  const journalctl = execa('journalctl', ['--user', '-u', unitName, '-f']);
 // journalctl.stdout.pipe(process.stdout);
  return journalctl;
}

async function wait(msecs = 1000) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, msecs);
  });
}

async function writeServiceDefinition(serviceDefinitionFileName, unitName, wd) {
  const which = await await execa("which", ["node"]);
  const node = which.stdout.trim(); 

  return fs.promises.writeFile(
    serviceDefinitionFileName,
    `[Unit]
Description=notifying service test
[Service]
Type=notify
ExecStart=${node} ${wd}/build/notify-test-cli

RuntimeDirectory=${unitName}
StateDirectory=${unitName}
ConfigurationDirectory=${unitName}

`,
    { encoding: "utf8" }
  );
}

test("service states", async t => {
  const wd = process.cwd();

  await execa("rollup", ["-c", "tests/rollup.config.js"]);

  const unitName = "notify-test";
  const serviceDefinitionFileName = join(wd, `build/${unitName}.service`);

  await writeServiceDefinition(serviceDefinitionFileName, unitName, wd);
  await execa("systemctl", ["--user", "link", serviceDefinitionFileName]);

  const start = execa("systemctl", ["--user", "start", unitName]);

  //start.stdout.pipe(process.stdout);
  //start.stderr.pipe(process.stderr);

  const j = journalctl(unitName);

  let status, active;

  const statusInterval = setInterval(async () => {
    status = undefined;
    active = undefined;
    try {
      const systemctl = execa("systemctl", ["--user", "status", unitName]);
      systemctl.stdout.on("data", data => {
        let m = String(data).match(/Status:\s*"([^"]+)/);
        if (m) {
          status = m[1];
        }
        m = String(data).match(/Active:\s*(\w+)/);
        if (m) {
          active = m[1];
        }

        t.log(`systemctl status stdout: ${data}`);
      });
      systemctl.stderr.on("data", data => {
        t.log(`systemctl status stderr: ${data}`);
      });

      const p = await systemctl;
    }
    catch (e) {
      t.log(e);
    }
  }, 1000);

  await start;

  await wait(3000);

  t.is(status, "running");
  t.is(active, "active");

  const stop = execa("systemctl", ["--user", "stop", unitName]);
  await stop;

  await wait(4000);

  t.is(active, "inactive");

  clearInterval(statusInterval);

  //t.log(j);
  //j.cancel();

  await execa("systemctl", ["--user", "disable", unitName]);
});
