import { EventBus } from "../game/EventBus";
interface Loggers {
	log: (playerSpecialDescription: string) => void;
};
export class ConsoleLogger implements Loggers {
    log(playerSpecialDescription: string) {
        EventBus.emit("special-combat-text", { playerSpecialDescription });
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

	log(playerSpecialDescription: string){
		this.logger.forEach(logger => {
			logger.log(playerSpecialDescription);
		});
	};
};