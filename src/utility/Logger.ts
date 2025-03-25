import { EventBus } from "../game/EventBus";
interface Loggers {
	log: (message: string) => void;
};
export class ConsoleLogger implements Loggers {
    log(message: string) {
        EventBus.emit("special-combat-text", {playerSpecialDescription:message});
    };
};
export default class Logger {
    private logger = new Map<string, Loggers>();
    add(name: string, logger: Loggers) {
		this.logger.set(name, logger);
	};

	remove(name: string) {
		this.logger.delete(name);
	};

	log(message: string){
		this.logger.forEach(logger => {
			logger.log(message);
		});
	};
};