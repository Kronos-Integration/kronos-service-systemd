import test from "ava";
import { writeFileSync } from "fs";
import { createConnection } from "net";
import { homedir } from "os";

import {
  monitorUnit,
  journalctl,
  systemctl,
  wait,
  unitName,
  port,
  beforeUnits,
  afterUnits
} from "./helpers/util.mjs";

const configFile = `${homedir()}/.config/${unitName}/config.json`;

test.before(async t => {
  writeFileSync(configFile, '{"test": { "serial": 0 }}', {
    encoding: "utf8"
  });

  await beforeUnits(t);
});

test.after(afterUnits);

test.serial("service states", async t => {
  systemctl("start", unitName);

  let status, active;
  const m = monitorUnit(unitName, unit => {
    //t.log(unit);
    active = unit.active;
    status = unit.status;
  });

  await wait(2000);

  t.is(status, "running");
  t.is(active, "active");

  await systemctl("stop", unitName);

  await wait(2000);

  t.is(active, "inactive");

  await m.stop();
});

test.serial.skip("service socket states", async t => {
  await systemctl("start", unitName + ".socket");

  await wait(2000);

  const client = createConnection(
    {
      host: "localhost",
      port
    },
    err => console.log("connected", err)
  );
  client.on("data", data => console.log("Server", data));

  let status, active;
  const m = monitorUnit(unitName, unit => {
    //t.log(unit);
    active = unit.active;
    status = unit.status;
  });

  t.is(status, "running");
  t.is(active, "active");

  await systemctl("stop", unitName);

  await wait(2000);

  t.is(active, "inactive");

  await m.stop();
});

test.serial("service kill", async t => {
  systemctl("restart", unitName);

  let pid, active, status;

  const m = monitorUnit(unitName, unit => {
    active = unit.active;
    status = unit.status;
    pid = unit.pid;
    t.log(active, status, pid);
  });

  await wait(1500);

  try {
    process.kill(pid);
  } catch (e) {}

  await wait(2000);

  t.is(active, "inactive");
  await m.stop();
});

test.serial.skip("service SIGHUP", async t => {
  systemctl("restart", unitName);

  let pid, active, status;

  const m = monitorUnit(unitName, unit => {
    active = unit.active;
    status = unit.status;
    pid = unit.pid;
  });

  await wait(1500);

  writeFileSync(configFile, '{"test": { "serial": 4711 }}', {
    encoding: "utf8"
  });

  process.kill(pid, "SIGHUP");

  let m1 = {};
  let i = 0;
  for await (const entry of journalctl(unitName)) {
    t.log(entry.MESSAGE);

    if (entry.MESSAGE.match(/SERIAL 4711/)) {
      m1 = entry;
      process.kill(pid);
    }
    i++;
    if (i >= 15) break;
  }

  await wait(2000);

  t.is(m1.MESSAGE, "config SERIAL 4711");

  t.is(unit.active, "inactive");
  await m.stop();
});
