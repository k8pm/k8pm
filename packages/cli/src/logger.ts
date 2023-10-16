import { Logger } from "@k8pm/logger";
import { AppContainer } from "./ioc";

const logger = new Logger().createLogger("cli");

AppContainer.set("logger", logger);
