#!/usr/bin/env node
import "reflect-metadata";
import "./logger";
import "./handlers/install";
import "./handlers/uninstall";
import "./handlers/list";
import { CLI } from "./cli";
import { AppContainer } from "./ioc";

const cli = AppContainer.get<CLI>(CLI);

cli.parseArgs(process.argv.slice(2));
cli.execute();
