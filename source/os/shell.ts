/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */

// TODO: Write a base class / prototype for system services and let Shell inherit from it.

module TSOS {
    export class Shell {
        // Properties
        public promptStr = ">";
        public commandList = [];
        public curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
        public apologies = "[sorry]";

        constructor() {
        }

        public init() {
            var sc: ShellCommand;
            //
            // Load the command list.

            // ver
            sc = new ShellCommand(this.shellVer,
                                  "ver",
                                  "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;

            // help
            sc = new ShellCommand(this.shellHelp,
                                  "help",
                                  "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;

            // shutdown
            sc = new ShellCommand(this.shellShutdown,
                                  "shutdown",
                                  "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;

            // cls
            sc = new ShellCommand(this.shellCls,
                                  "cls",
                                  "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;

            // man <topic>
            sc = new ShellCommand(this.shellMan,
                                  "man",
                                  "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;

            // trace <on | off>
            sc = new ShellCommand(this.shellTrace,
                                  "trace",
                                  "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;

            // rot13 <string>
            sc = new ShellCommand(this.shellRot13,
                                  "rot13",
                                  "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;

            // prompt <string>
            sc = new ShellCommand(this.shellPrompt,
                                  "prompt",
                                  "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;

            // date
            sc = new ShellCommand(this.shellDate,
                                  "date",
                                  "- Displays the current date and time.");
            this.commandList[this.commandList.length] = sc;

            // whereami
            sc = new ShellCommand(this.shellWhereami,
                                  "whereami",
                                  "- Displays current location.");
            this.commandList[this.commandList.length] = sc;
			
			// status <string>
			sc = new ShellCommand(this.shellStatus,
								  "status",
								  "<string> - Sets the current status.");
			this.commandList[this.commandList.length] = sc;
			
			// load
			sc = new ShellCommand(this.shellLoad,
								  "load",
								  "- Retrieves the user program, verifies it, and prepares it to be run in memory.");
			this.commandList[this.commandList.length] = sc;
			
			// run
			sc = new ShellCommand(this.shellRun,
								  "run",
								  "<integer> - Runs the program with the provided Process ID, if it's in memory.");
			this.commandList[this.commandList.length] = sc;
			
			// brick <string>
			sc = new ShellCommand(this.shellBrick,
								  "brick",
								  "<string> - Triggers the fatal error response. Optional custom message.");
			this.commandList[this.commandList.length] = sc;
			
			// roll <integer>
			sc = new ShellCommand(this.shellRoll,
								  "roll",
								  "<integer> - Rolls a die with the specified number of sides.");
			this.commandList[this.commandList.length] = sc;
			
			// kos-mos
			sc = new ShellCommand(this.shellKos,
								  "kosmos",
								  "- Generates a random number to see if you get Kos-mos in Xenoblade 2.");
			this.commandList[this.commandList.length] = sc;

            // ps  - list the running processes and their IDs
            // kill <id> - kills the specified process id.

            // Display the initial prompt.
            this.putPrompt();
        }

        public putPrompt() {
            _StdOut.putText(this.promptStr);
        }

        public handleInput(buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            //
            // Parse the input...
            //
            var userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;
            //
            // Determine the command and execute it.
            //
            // TypeScript/JavaScript may not support associative arrays in all browsers so we have to iterate over the
            // command list in attempt to find a match. 
            // TODO: Is there a better way? Probably. Someone work it out and tell me in class.
            var index: number = 0;
            var found: boolean = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                } else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);  // Note that args is always supplied, though it might be empty.
            } else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + Utils.rot13(cmd) + "]") >= 0) {     // Check for curses.
                    this.execute(this.shellCurse);
                } else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {        // Check for apologies.
                    this.execute(this.shellApology);
                } else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        }

        // Note: args is an optional parameter, ergo the ? which allows TypeScript to understand that.
        public execute(fn, args?) {
            // We just got a command, so advance the line...
            _StdOut.advanceLine();
            // ... call the command function passing in the args with some über-cool functional programming ...
            fn(args);
            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            // ... and finally write the prompt again.
            this.putPrompt();
        }

        public parseInput(buffer: string): UserCommand {
            var retVal = new UserCommand();

            // 1. Remove leading and trailing spaces.
            buffer = Utils.trim(buffer);

            // 2. Lower-case it.
            buffer = buffer.toLowerCase();

            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");

            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift();  // Yes, you can do that to an array in JavaScript. See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;

            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        }

        //
        // Shell Command Functions. Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        public shellInvalidCommand() {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            } else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        }

        public shellCurse() {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        }

        public shellApology() {
           if (_SarcasticMode) {
              _StdOut.putText("I think we can put our differences behind us.");
              _StdOut.advanceLine();
              _StdOut.putText("For science . . . You monster.");
              _SarcasticMode = false;
           } else {
              _StdOut.putText("For what?");
           }
        }

        // Although args is unused in some of these functions, it is always provided in the 
        // actual parameter list when this function is called, so I feel like we need it.

        public shellVer(args: string[]) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        }

        public shellHelp(args: string[]) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        }

        public shellShutdown(args: string[]) {
             _StdOut.putText("Shutting down...");
             // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed. If possible. Not a high priority. (Damn OCD!)
        }

        public shellCls(args: string[]) {         
            _StdOut.clearScreen();     
            _StdOut.resetXY();
        }

        public shellMan(args: string[]) {
            if (args.length > 0) {
                var topic = args[0];
                switch (topic) {
					case "ver":
						_StdOut.putText("Ver shows the current OntOS version.");
						break;
                    case "help":
                        _StdOut.putText("Help displays a list of (hopefully) valid commands.");
                        break;
					case "shutdown":
						_StdOut.putText("Shutdown ends the OS process without clearing the screen.");
						break;
					case "cls":
						_StdOut.putText("Cls wipes all that mess you made off the screen.");
						break;
					case "man":
						_StdOut.putText("Man displays a manual for the command that comes afterward.");
						break;
					case "trace":
						_StdOut.putText("Trace toggles the OS tracing available in the Host Log.");
						break;
					case "rot13":
						_StdOut.putText("Rot13 takes the following text and shifts each letter by 13.");
						break;
					case "prompt":
						_StdOut.putText("Prompt sets the opening text of each line to the given text.");
						break;
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            } else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        }

        public shellTrace(args: string[]) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        } else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }
                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
                }
            } else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        }

        public shellRot13(args: string[]) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + Utils.rot13(args.join(' ')) +"'");
            } else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }

        public shellPrompt(args: string[]) { //Allows the user to change the prompt from just ">"
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            } else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }
		
		public shellDate(args: string[]) { //Gives the user the current date
			var d = new Date();
			_StdOut.putText("The current date is "+d+".");
		}
		
		public shellWhereami(args: string[]) { //Prints a predefined message
			_StdOut.putText("The current location identifies as...");
			_StdOut.advanceLine();
			_StdOut.putText("First Low Orbit Station: Rhadamanthus.");
		}
		
		public shellStatus(args: string[]) { // Allows the user to input a status to display at the top of the screen
			if (args.length > 0) {
				var stat = args[0];
				for(var i = 1; i < args.length; i++) { // Args is an array split on spaces. For the status, we need to undo that.
					stat = stat + " " + args[i];
				}
				document.getElementById("statusIn").innerHTML = stat;
			}
			else {
                _StdOut.putText("Usage: status <string>  Please supply a string.");
			}
		}
		
		// Loads the code from the User Program Input field.
		shellLoad(args: string[]) { 
			// First, check if there's an uncompleted program in memory. Right now, only one program can be in memory, so check the last one.
			if(_ProcessCounter > 0 && !(_ProcessList[_ProcessCounter-1].completed) && !(_ProcessList[_ProcessCounter-1].rewrite)){
				_StdOut.putText("Warning: Previous program is not complete. Load again to overwrite program.");
				_ProcessList[_ProcessCounter-1].rewrite = true; // Each PCB has a rewrite flag. If set to true, it can be overwritten without being completed, meaning the user can load a new program without running the last.
			}
			else{
				
				if(_ProcessCounter > 0 && !(_ProcessList[_ProcessCounter-1].completed) && _ProcessList[_ProcessCounter-1].rewrite){ // Even if it wasn't used, though, each PCB should be marked as completed when wiped. Otherwise, an invalid process could be run.
					_ProcessList[_ProcessCounter-1].completed = true;
				}
				
				// Code checker - This works by a method I found online of converting the given code into a base 10 integer, then comparing it against the original hexadecimal string
				var a = (<HTMLInputElement> document.getElementById("taProgramInput")).value; 
				a = a.replace(/\s/g,''); // The integer cannot store spaces, so we remove them from the original string here.
				var fin = a; //If the code is valid, we will need to copy a at it's current point into memory, so we might as well store it in another variable instead of undoing later changes.
				
				// There are 2 checks to perform before checking if "a" is a valid hexadecimal string
				
				if(a.length==0) { // If there isn't a program (aka, the string is empty after removing spaces), just cut to the chase.
					_StdOut.putText("Please enter an instruction set.");
				}
				
				else if(a.length%2!=0) { // Hexadecimal opcodes come in pairs (00-FF), so the string length must be even.
					_StdOut.putText("The instruction set is invalid.");
				}
				
				else if(a.length > (MEM_SEGMENT_SIZE*2)){ // We should also check that it can actually fit into memory first, too (each byte is 2 characters).
					_StdOut.putText("The instruction set is too large.");
				}
				
				else { // If the string passes the prerequisites, check if it is valid hexadecimal.
					var valid = true; // This boolean will push us out if the hex is ever invalid.
					
					// Unfortunately, the method I found relies on converting the hexadecimal to a 4-byte integer, which means I have to chunk it up like this to verify.
					while(valid && a.length>8) { // I'm sure there's a way to do this cleaner, like through a for loop or something, but I'm just not sure how to do that.
						var asub = a.substring(0, 8); // Grab a 4 byte chunk of a
						a = a.substring(8, a.length); // Remove that chunk from a
						var b = parseInt(asub,16); // Translate that chunk to a base 10 int
						while(asub.charAt(0)=='0') { // If there are zeroes at the beginning, they will not be there when the integer is converted back. We need both strings to match exactly.
							asub=asub.substring(1,asub.length);
						}
						if(!(asub.toLowerCase() == b.toString(16))){ // Translate the int back, and compare.
							valid = false;
						}
					}
					
					// After the above loop, we have 4 bytes or less left, so we can just let it rip from here
					var b = parseInt(a,16); // Translate what's left to a base 10 int
					
					while(a.charAt(0)=='0') { // If there are zeroes at the beginning, they will not be there when the integer is converted back. We need both strings to match exactly.
						a=a.substring(1,a.length);
					}
					
					if(valid && (a.toLowerCase()==b.toString(16))) {
						_StdOut.putText("The instruction set is valid.");
						_StdOut.advanceLine();
						_Memory.init(); // Memory should be cleared before writing new programs.
						for (let i = 0; i < fin.length; i+=2) { // Write the user code into memory, byte by byte (yes, bytes are still 2 characters).
							_MemoryAccessor.write(i/2, (fin.charAt(i)+fin.charAt(i+1)));
						}
						_ProcessList.push(new ProcessControlBlock());
						_StdOut.putText("New Process ID: "+_ProcessCounter);
						_ProcessCounter++;
					}
					else {
						_StdOut.putText("The instruction set is invalid.");
					}
				}
			}
		}
		
		// Finally, what computers were made for: Running ~~Doom~~ programs!
		shellRun(args: string[]) { //Runs a program with the given PID
			var pid = parseInt(args[0], 10);
			if(pid<_ProcessCounter && pid >= 0){
				if(_ProcessList[pid].completed){
					_StdOut.putText("That process has already been completed!");
				}
				else{
					_StdOut.putText("Beginning Process "+pid);
					_StdOut.advanceLine();
					_CPU.execute(pid);
				}
			}
			else{
				_StdOut.putText("Please enter a valid PID!");
			}
		}
		
		
		//Kill them all. Every last one of them.
		shellBrick(args: string[]) { //Forces a crash
			var msg = "Manual";
			if(args.length>0){
				msg += ", " + args[0];
			}
			_Kernel.krnTrapError(msg);
		}
		
		shellRoll(args: string[]) { //Rolls a die of size args[0]
			if(args.length==0) { //If there's no arguments, we can't roll the die.
				_StdOut.putText("Usage: roll <integer>  Please supply an integer.");
			}
			else {
				var i = parseInt(args[0]);
				if(isNaN(i)) { //And we do need a valid integer
					_StdOut.putText("Usage: roll <integer>  Please supply a valid integer.");
				}
				else { //If we've got our size, generate a random number between 1 and it.
					_StdOut.putText("Rolling d"+i);
					_StdOut.advanceLine();
					_StdOut.putText("Result: "+(Math.floor(Math.random() * Math.floor(i))+1));
				}
			}
		}
		
		shellKos(args: string[]){ //there is a .01% chance to get the character kos-mos every time you summon a character in xenoblade 2. please god just give me some luck
			if(Math.random()<=.0001){
				if(_SarcasticMode){ _StdOut.putText("HOLY FUCKING SHIT, GO BUY A LOTTERY TICKET"); }
				else { _StdOut.putText("You did it, you got KOS-MOS!"); }
			}
			else {
				_StdOut.putText("You did not get KOS-MOS");
				if(_SarcasticMode) {
					_StdOut.advanceLine();
					_StdOut.putText("...Loser.");
				}
			}
		}

    }
}
