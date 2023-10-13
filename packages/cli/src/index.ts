import { AppContainer } from "./ioc";
import { CthuluCli } from "./cli";
import "./handlers/install";

const cli = AppContainer.get<CthuluCli>(CthuluCli.name);

cli.parseArgs(process.argv.slice(2));
cli.execute();
