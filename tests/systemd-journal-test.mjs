import test from "ava";
import { join } from "path";

import {
  journalctl,
  systemctl,
  writeUnitDefinition,
} from "./util.mjs";

const unitName = "notify-test";

test.before(async t => {
  const wd = process.cwd();

  const unitDefinitionFileName = join(wd, `build/${unitName}.service`);
  await writeUnitDefinition(unitDefinitionFileName, unitName, wd);
  try {
    await systemctl("link", unitDefinitionFileName);
  } catch (e) {}
  try {
    await systemctl("link", socketUnitDefinitionFileName);
  } catch (e) {}
});

test.after("cleanup", async t => {
  await systemctl("disable", unitName);
});

test("logging", async t => {
  await systemctl("restart", unitName);

  const entries = [];

  for await (const entry of journalctl(unitName)) {
    entries.push(entry);
    console.log(entry.MESSAGE);
    if (entry.MESSAGE === "some values") {
      break;
    }
  }

  let m;

  m = entries.find(m => m.MESSAGE === "Cannot read property 'doSomething' of undefined");
  t.truthy(m);
  t.is(m.PRIORITY, "3");
  t.truthy(m.STACK.startsWith("TypeError: Cannot read property 'doSomething' of undefined\nat actions (/"));

  m = entries.find(m => m.MESSAGE === "this is an Error");
  t.truthy(m);
  t.is(m.PRIORITY, "3");
  t.truthy(m.STACK.startsWith("Error: this is an Error\nat actions (/"));

  m = entries.find(m => m.MESSAGE === "error test after start");
  t.truthy(m);
  t.is(m.PRIORITY, "3");

  m = entries.find(m => m.MESSAGE === "debug test after start");
  t.truthy(m);
  t.is(m.PRIORITY, "7");

  m = entries.find(m => m.SERVICE === "systemd");
  t.truthy(m);

  m = entries.find(m => m.MESSAGE === "some values");
  t.truthy(m);
  t.is(m.PRIORITY, "6");
  t.is(m.BIGINT, '77');
  t.is(m.NUMBER, '42');
  t.is(m.BOOLEAN, 'false');
  t.is(m.ARRAY, 'A\nB\nC\nAA');
   // t.is(m.AOBJECT, '');

  await systemctl("stop", unitName);
});
