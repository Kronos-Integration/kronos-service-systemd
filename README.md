[![npm](https://img.shields.io/npm/v/@kronos-integration/service-systemd.svg)](https://www.npmjs.com/package/@kronos-integration/service-systemd)
[![License](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)
[![minified size](https://badgen.net/bundlephobia/min/@kronos-integration/service-systemd)](https://bundlephobia.com/result?p=@kronos-integration/service-systemd)
[![downloads](http://img.shields.io/npm/dm/@kronos-integration/service-systemd.svg?style=flat-square)](https://npmjs.org/package/@kronos-integration/service-systemd)
[![GitHub Issues](https://img.shields.io/github/issues/Kronos-Integration/service-systemd.svg?style=flat-square)](https://github.com/Kronos-Integration/service-systemd/issues)
[![Build Status](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2FKronos-Integration%2Fservice-systemd%2Fbadge&style=flat)](https://actions-badge.atrox.dev/Kronos-Integration/service-systemd/goto)
[![Styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![Known Vulnerabilities](https://snyk.io/test/github/Kronos-Integration/service-systemd/badge.svg)](https://snyk.io/test/github/Kronos-Integration/service-systemd)
[![Coverage Status](https://coveralls.io/repos/Kronos-Integration/service-systemd/badge.svg)](https://coveralls.io/github/Kronos-Integration/service-systemd)

# @kronos-integration/service-systemd

kronos systemd integration

*   sync node state to systemd with notify (done)
*   propagate config into kronos (done)
*   propagate socket activations into kronos (partly)
*   start / stop / restart / reload initiated from systemd (partly)
*   log into journal (done)

# usage

# API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### Table of Contents

*   [JournalLogger](#journallogger)
*   [FileDescriptor](#filedescriptor)
    *   [Properties](#properties)
*   [SystemdConfig](#systemdconfig)
    *   [Properties](#properties-1)
    *   [listeningFileDescriptors](#listeningfiledescriptors)
    *   [loadConfig](#loadconfig)
*   [ServiceSystemd](#servicesystemd)

## JournalLogger

**Extends ServiceLogger**

Forward logs entries to the journal.

## FileDescriptor

Type: [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

### Properties

*   `name` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** 
*   `fd` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** 

## SystemdConfig

**Extends ServiceConfig**

Provides config from CONFIGURATION_DIRECTORY.
Also injects listeningFileDescriptors into the config

### Properties

*   `configurationDirectory` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** taken from CONFIGURATION_DIRECTORY

### listeningFileDescriptors

listeningFileDescriptors as passed in LISTEN_FDS and LISTEN_FDNAMES.

Returns **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)<[FileDescriptor](#filedescriptor)>** 

### loadConfig

Load config from configuration dir.
Additionally pass listeninfFileDescriptions into config.

## ServiceSystemd

**Extends ServiceProviderMixin(Service, JournalLogger, SystemdConfig)**

Kronos bridge to systemd:

*   sync node state to systemd with notify
*   propagate config into kronos world
*   propagate socket activations into kronos (partly)
*   start / stop / restart / reload initiated from systemd
*   log into journal

# install

With [npm](http://npmjs.org) do:

```shell
npm install @kronos-integration/service-systemd
```

# license

BSD-2-Clause
