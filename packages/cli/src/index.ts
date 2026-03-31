import { Command } from "commander";
import { initCommand } from "./commands/init.js";
import { addCommand } from "./commands/add.js";
import { listCommand } from "./commands/list.js";
import { removeCommand } from "./commands/remove.js";

const program = new Command();

program
  .name("win7ui")
  .description("Add Windows 7 UI components to your project")
  .version("0.1.0");

program.addCommand(initCommand);
program.addCommand(addCommand);
program.addCommand(listCommand);
program.addCommand(removeCommand);

program.parse();
