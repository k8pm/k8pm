import { Logger } from "@fr8/logger";
import { AppContainer } from "./ioc";

const logger = new Logger().createLogger("cli");

AppContainer.set("logger", logger);
