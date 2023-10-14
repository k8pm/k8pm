import { Logger } from "@fr8/logger";
import { AppContainer } from "./ioc";

const logger = new Logger().createLogger("chart");

AppContainer.set("logger", logger);
