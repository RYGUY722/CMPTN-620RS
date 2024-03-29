/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */
// TODO: Write a base class / prototype for system services and let Shell inherit from it.
var TSOS;
(function (TSOS) {
    class Shell {
        constructor() {
            // Properties
            this.promptStr = ">";
            this.commandList = [];
            this.curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
            this.apologies = "[sorry]";
        }
        init() {
            var sc;
            //
            // Load the command list.
            // ver
            sc = new TSOS.ShellCommand(this.shellVer, "ver", "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;
            // help
            sc = new TSOS.ShellCommand(this.shellHelp, "help", "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;
            // shutdown
            sc = new TSOS.ShellCommand(this.shellShutdown, "shutdown", "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;
            // cls
            sc = new TSOS.ShellCommand(this.shellCls, "cls", "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;
            // man <topic>
            sc = new TSOS.ShellCommand(this.shellMan, "man", "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;
            // trace <on | off>
            sc = new TSOS.ShellCommand(this.shellTrace, "trace", "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;
            // rot13 <string>
            sc = new TSOS.ShellCommand(this.shellRot13, "rot13", "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;
            // prompt <string>
            sc = new TSOS.ShellCommand(this.shellPrompt, "prompt", "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;
            // date
            sc = new TSOS.ShellCommand(this.shellDate, "date", "- Displays the current date and time.");
            this.commandList[this.commandList.length] = sc;
            // whereami
            sc = new TSOS.ShellCommand(this.shellWhereami, "whereami", "- Displays current location.");
            this.commandList[this.commandList.length] = sc;
            // status <string>
            sc = new TSOS.ShellCommand(this.shellStatus, "status", "<string> - Sets the current status.");
            this.commandList[this.commandList.length] = sc;
            // load
            sc = new TSOS.ShellCommand(this.shellLoad, "load", "- Retrieves the user program, verifies it, and prepares it to be run in memory.");
            this.commandList[this.commandList.length] = sc;
            // run <integer>
            sc = new TSOS.ShellCommand(this.shellRun, "run", "<integer> - Runs the program with the provided Process ID, if it's in memory.");
            this.commandList[this.commandList.length] = sc;
            // runall
            sc = new TSOS.ShellCommand(this.shellRunAll, "runall", "- Runs all programs currently in memory.");
            this.commandList[this.commandList.length] = sc;
            // clearmem
            sc = new TSOS.ShellCommand(this.shellClearMem, "clearmem", "- Clears all memory partitions.");
            this.commandList[this.commandList.length] = sc;
            // ps
            sc = new TSOS.ShellCommand(this.shellPs, "ps", "- Shows the processes and their PIDs in memory.");
            this.commandList[this.commandList.length] = sc;
            // kill <integer>
            sc = new TSOS.ShellCommand(this.shellKill, "kill", "<integer> - Kills the currently running process with the given PID.");
            this.commandList[this.commandList.length] = sc;
            // killall
            sc = new TSOS.ShellCommand(this.shellKillAll, "killall", "- Kills all currently running processes.");
            this.commandList[this.commandList.length] = sc;
            // quantum <integer>
            sc = new TSOS.ShellCommand(this.shellQuantum, "quantum", "<integer> - Sets the Round Robin scheduler's quantum.");
            this.commandList[this.commandList.length] = sc;
            // brick <string>
            sc = new TSOS.ShellCommand(this.shellBrick, "brick", "<string> - Triggers the fatal error response. Optional custom message.");
            this.commandList[this.commandList.length] = sc;
            // roll <integer>
            sc = new TSOS.ShellCommand(this.shellRoll, "roll", "<integer> - Rolls a die with the specified number of sides.");
            this.commandList[this.commandList.length] = sc;
            // kos-mos
            sc = new TSOS.ShellCommand(this.shellKos, "kosmos", "- Generates a random number to see if you get Kos-mos in Xenoblade 2.");
            this.commandList[this.commandList.length] = sc;
            // format <mode>
            sc = new TSOS.ShellCommand(this.shellFormat, "format", "<mode> - Formats HTML session storage to create and clear the disk.");
            this.commandList[this.commandList.length] = sc;
            // create <string>
            sc = new TSOS.ShellCommand(this.shellCreate, "create", "<string> - Creates a file with the given filename.");
            this.commandList[this.commandList.length] = sc;
            // rename <string> <string>
            sc = new TSOS.ShellCommand(this.shellRename, "rename", "<string> <string> - Renames the file with the given filename to the new filename.");
            this.commandList[this.commandList.length] = sc;
            // copy <string>
            sc = new TSOS.ShellCommand(this.shellCopy, "copy", "<string> - Copies the file with the given filename.");
            this.commandList[this.commandList.length] = sc;
            // write <string> <string>
            sc = new TSOS.ShellCommand(this.shellWrite, "write", "<string> - writes the text to the file with the given filename.");
            this.commandList[this.commandList.length] = sc;
            // read <string>
            sc = new TSOS.ShellCommand(this.shellRead, "read", "<string> - Prints the contents of the file with the given filename.");
            this.commandList[this.commandList.length] = sc;
            // ls <string>
            sc = new TSOS.ShellCommand(this.shellList, "ls", "<mode> - Returns all filenames. Use -l to view hidden files.");
            this.commandList[this.commandList.length] = sc;
            // delete <string>
            sc = new TSOS.ShellCommand(this.shellDelete, "delete", "<string> - Deletes the file with the given filename.");
            this.commandList[this.commandList.length] = sc;
            // setschedule <rr|fcfs|priority>
            sc = new TSOS.ShellCommand(this.shellSetSchedule, "setschedule", "<rr|fcfs|priority> - Sets the scheduler algorithm.");
            this.commandList[this.commandList.length] = sc;
            // getschedule
            sc = new TSOS.ShellCommand(this.shellGetSchedule, "getschedule", "- Returns the current scheduler algorithm.");
            this.commandList[this.commandList.length] = sc;
            // language
            sc = new TSOS.ShellCommand(this.shellGetSchedule, "language", "- Returns the current and available languages or sets it.");
            this.commandList[this.commandList.length] = sc;
            // Display the initial prompt.
            this.shellVer([]);
            _StdOut.advanceLine();
            _StdOut.putText("READY");
            _StdOut.advanceLine();
            this.putPrompt();
        }
        putPrompt() {
            _StdOut.putText(this.promptStr);
        }
        handleInput(buffer) {
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
            var index = 0;
            var found = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                }
                else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args); // Note that args is always supplied, though it might be empty.
            }
            else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + TSOS.Utils.rot13(cmd) + "]") >= 0) { // Check for curses.
                    this.execute(this.shellCurse);
                }
                else if (this.apologies.indexOf("[" + cmd + "]") >= 0) { // Check for apologies.
                    this.execute(this.shellApology);
                }
                else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        }
        // Note: args is an optional parameter, ergo the ? which allows TypeScript to understand that.
        execute(fn, args) {
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
        parseInput(buffer) {
            var retVal = new TSOS.UserCommand();
            // 1. Remove leading and trailing spaces.
            buffer = TSOS.Utils.trim(buffer);
            // 2. Lower-case it.
            buffer = buffer.toLowerCase();
            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");
            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift(); // Yes, you can do that to an array in JavaScript. See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = TSOS.Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;
            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = TSOS.Utils.trim(tempList[i]);
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
        shellInvalidCommand() {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            }
            else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        }
        shellCurse() {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        }
        shellApology() {
            if (_SarcasticMode) {
                _StdOut.putText("I think we can put our differences behind us.");
                _StdOut.advanceLine();
                _StdOut.putText("For science . . . You monster.");
                _SarcasticMode = false;
            }
            else {
                _StdOut.putText("For what?");
            }
        }
        // Although args is unused in some of these functions, it is always provided in the 
        // actual parameter list when this function is called, so I feel like we need it.
        shellVer(args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        }
        shellHelp(args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        }
        shellShutdown(args) {
            _StdOut.putText("Shutting down...");
            // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed. If possible. Not a high priority. (Damn OCD!)
        }
        shellCls(args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        }
        shellMan(args) {
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
            }
            else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        }
        shellTrace(args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        }
                        else {
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
            }
            else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        }
        shellRot13(args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + TSOS.Utils.rot13(args.join(' ')) + "'");
            }
            else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }
        // Allows the user to change the prompt from just ">".
        shellPrompt(args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            }
            else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }
        // Gives the user the current date.
        shellDate(args) {
            var d = new Date();
            _StdOut.putText("The current date is " + d + ".");
        }
        // Prints a predefined message.
        shellWhereami(args) {
            _StdOut.putText("The current location identifies as...");
            _StdOut.advanceLine();
            _StdOut.putText("First Low Orbit Station: Rhadamanthus.");
        }
        // Allows the user to input a status to display at the top of the screen.
        shellStatus(args) {
            if (args.length > 0) {
                var stat = args[0];
                for (var i = 1; i < args.length; i++) { // Args is an array split on spaces. For the status, we need to undo that.
                    stat = stat + " " + args[i];
                }
                document.getElementById("statusIn").innerHTML = stat; // Who cares about keeping it in a variable somewhere, just change the HTML of the page directly.
            }
            else { // If the user didn't give us a status message, tell them how stupid they are.
                _StdOut.putText("Usage: status <string>  Please supply a string.");
            }
        }
        // Loads the code from the User Program Input field.
        shellLoad(args) {
            // Code checker - This works by a method I found online of converting the given code into a base 10 integer, then comparing it against the original hexadecimal string
            var a = document.getElementById("taProgramInput").value;
            a = a.replace(/\s/g, ''); // The integer cannot store spaces, so we remove them from the original string here.
            var fin = a; //If the code is valid, we will need to copy a at it's current point into memory, so we might as well store it in another variable instead of undoing later changes.
            // There are 2 checks to perform before checking if "a" is a valid hexadecimal string
            if (a.length == 0) { // If there isn't a program (aka, the string is empty after removing spaces), just cut to the chase.
                _StdOut.putText("Please enter an instruction set.");
            }
            else if (a.length % 2 != 0) { // Hexadecimal opcodes come in pairs (00-FF), so the string length must be even.
                _StdOut.putText("The instruction set is invalid.");
            }
            else if (a.length > (MEM_SEGMENT_SIZE * 2)) { // We should also check that it can actually fit into memory first, too (each byte is 2 characters).
                _StdOut.putText("The instruction set is too large.");
            }
            else { // If the string passes the prerequisites, check if it is valid hexadecimal.
                var valid = true; // This boolean will push us out if the hex is ever invalid.
                // Unfortunately, the method I found relies on converting the hexadecimal to a 4-byte integer, which means I have to chunk it up like this to verify.
                while (valid && a.length > 8) { // I'm sure there's a way to do this cleaner, like through a for loop or something, but I'm just not sure how to do that.
                    var asub = a.substring(0, 8); // Grab a 4 byte chunk of a
                    a = a.substring(8, a.length); // Remove that chunk from a
                    var b = parseInt(asub, 16); // Translate that chunk to a base 10 int
                    while ((asub.charAt(0) == '0') && !(asub.length == 1)) { // If there are zeroes at the beginning, they will not be there when the integer is converted back. We need both strings to match exactly. If it's all zeroes, though, 1 should remain.
                        asub = asub.substring(1, asub.length);
                    }
                    if (!(asub.toLowerCase() == b.toString(16))) { // Translate the int back, and compare.
                        valid = false;
                    }
                }
                // After the above loop, we have 4 bytes or less left, so we can just let it rip from here
                var b = parseInt(a, 16); // Translate what's left to a base 10 int
                while ((a.charAt(0) == '0') && !(a.length == 1)) { // If there are zeroes at the beginning, they will not be there when the integer is converted back. We need both strings to match exactly. If it's all zeroes, though, 1 should remain.
                    a = a.substring(1, a.length);
                }
                if (valid && (a.toLowerCase() == b.toString(16))) {
                    _StdOut.putText("The instruction set is valid."); // Give the user feedback that their code is accepted.
                    _StdOut.advanceLine();
                    _ProcessList.push(new TSOS.ProcessControlBlock());
                    _StdOut.putText("New Process ID: " + _ProcessCounter);
                    _StdOut.advanceLine();
                    var targetSeg = _Scheduler.getNextFreeSeg(); // Find out what segment we're loading code into.
                    if (targetSeg != -1) { // If a segment is free, we'll try to load it into there.
                        _Scheduler.freeSeg(targetSeg); // Memory should be cleared before writing new programs.
                        _MemoryManager.load(fin, targetSeg); // Load the user's code into the memory
                        _Kernel.krnTrace("PID " + _ProcessCounter + " loaded into memory at segment " + targetSeg);
                        _StdOut.putText("Process loaded into segment " + targetSeg);
                        _StdOut.advanceLine();
                        _ProcessList[_ProcessCounter].Location = "Memory";
                    }
                    else { // If it was -1, there are no free segments and we have to load into storage.
                        if (_Kernel.krnFileIO(11, [fin])) { // Making sure the disk has enough space
                            _Kernel.krnFileIO(6, [".SWAP~" + _ProcessCounter]);
                            _Kernel.krnFileIO(7, [".SWAP~" + _ProcessCounter, fin]);
                            _ProcessList[_ProcessCounter].Location = "Disk";
                            _Kernel.krnTrace("PID " + _ProcessCounter + " loaded into storage");
                            _StdOut.putText("Process loaded into storage.");
                            _StdOut.advanceLine();
                        }
                        else {
                            _StdOut.putText("No memory available. Loading failed.");
                        }
                    }
                    if (args.length > 0) { // All of this code is done anyways.
                        _ProcessList[_ProcessCounter].priority = parseInt(args[0]);
                    }
                    _ProcessList[_ProcessCounter].Segment = targetSeg;
                    _Scheduler.addProcess(_ProcessCounter);
                    _ProcessCounter++;
                }
                else {
                    _StdOut.putText("The instruction set is invalid.");
                }
            }
        }
        // Finally, what computers were made for: Running ~~Doom~~ programs!
        shellRun(args) {
            var pid = parseInt(args[0], 10);
            if (pid < _ProcessCounter && pid >= 0) {
                if (_ProcessList[pid].completed) {
                    _StdOut.putText("That process has already been completed!");
                }
                else {
                    _StdOut.putText("Beginning Process " + pid); // Inform the user that execution is beginning
                    _StdOut.advanceLine();
                    _Scheduler.readyProcess(pid); // Log the process as ready to run in the scheduler
                    if (_Scheduler.mode == "priority") { // If we're on priority mode, sort all the processes based on their priority.
                        _ReadyList.prioritySort(0, _ReadyList.getSize() - 1);
                        _Kernel.krnTrace("Sorted readied processes by priority.");
                    }
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(SCHEDULER_IRQ, null)); // Prep the dispatcher
                    _CPU.isExecuting = true; // The CPU is now beginning execution.
                }
            }
            else {
                _StdOut.putText("Please enter a valid PID!");
            }
        }
        // Runs all programs in memory.
        shellRunAll(args) {
            for (var i = 0; i < _LoadedList.length; i++) {
                var pid = _LoadedList[i];
                if (pid >= 0) {
                    _Scheduler.readyProcess(pid); // Log the process as ready to run in the scheduler
                    _StdOut.putText("Readied Process " + pid); // Inform the user that the process is ready
                    _StdOut.advanceLine();
                }
            }
            if (_ReadyList.isEmpty()) {
                _StdOut.putText("There are no processes currently loaded!"); // Inform the user that they need to load a program first
                _StdOut.advanceLine();
            }
            else {
                _StdOut.putText("Beginning program execution"); // Inform the user that execution is beginning
                _StdOut.advanceLine();
                if (_Scheduler.mode == "priority") { // If we're on priority mode, sort all the processes based on their priority.
                    _ReadyList.prioritySort(0, _ReadyList.getSize() - 1);
                    _Kernel.krnTrace("Sorted readied processes by priority.");
                }
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(SCHEDULER_IRQ, null)); // Prep the dispatcher
                _CPU.isExecuting = true; // The CPU is now beginning execution.
            }
        }
        // Clears all the memory at once.
        shellClearMem(args) {
            if (_CPU.isExecuting) { // If the CPU is currently running, block the attempt to clear the memory.
                _StdOut.putText("Programs are currently running, please wait for completion.");
                _StdOut.advanceLine();
            }
            else { // Otherwise, end each process in the resident list.
                for (var i = 0; i <= MEM_SEGMENTS; i++) {
                    if (_ResidentList[i] >= 0) {
                        _Scheduler.endProcess(_ResidentList[i]);
                    }
                }
                _MemoryManager.clear();
                _StdOut.putText("Memory fully cleared.");
                _StdOut.advanceLine();
            }
        }
        // Lists all currently loaded proceses.
        shellPs(args) {
            _StdOut.putText("Current processes:"); // Print a header to the table
            _StdOut.advanceLine();
            for (var i = 0; i <= _LoadedList.length; i++) {
                _StdOut.putText("Process " + _LoadedList[i] + " - Status: " + _ProcessList[_LoadedList[i]].State.toString()); // Print the PID of each resident process and its state
                _StdOut.advanceLine();
            }
        }
        // Kill a specific running process.
        shellKill(args) {
            var pid = parseInt(args[0], 10);
            if (pid < _ProcessCounter && pid >= 0) {
                if (_ProcessList[pid].State == "running" || _ProcessList[pid].State == "ready") {
                    if (pid == _CurrentProcess) { // If we're killing the current process, 
                        _KernelInterruptQueue.enqueue(new TSOS.Interrupt(SCHEDULER_IRQ, null)); // Then log an interrupt for the scheduler to find a new process for us next cycle.
                    }
                    _Scheduler.endProcess(pid); // Tell the scheduler that the process is done now.
                }
                else {
                    _StdOut.putText("That process is not running!");
                }
            }
            else {
                _StdOut.putText("Please enter a valid PID!");
            }
        }
        // Kill all currently running processes.
        shellKillAll(args) {
            var pid;
            while (!_ReadyList.isEmpty()) { // For every object in the Ready List
                pid = _ReadyList.dequeue(); // Remove it
                _Scheduler.endProcess(pid); // Tell the scheduler that the process is done now.
            }
            if (_CurrentProcess >= 0) { // If something's still running (which it should be), it won't be on the Ready List. We kill it separately here.
                _Scheduler.endProcess(_CurrentProcess);
            }
            _KernelInterruptQueue.enqueue(new TSOS.Interrupt(SCHEDULER_IRQ, null)); // After we're done, tell the scheduler to check its notes, where it will realize it has nothing left to execute and put the CPU to sleep.
        }
        // Adjusts the number of cycles each process gets to hog the processor for in round robin mode.
        shellQuantum(args) {
            var quant = parseInt(args[0], 10);
            if (quant >= 1) {
                _Scheduler.quantum = quant;
            }
            else {
                _StdOut.putText("Please enter a valid integer above 1!");
                _StdOut.advanceLine();
            }
        }
        // Kill them all. Every last one of them.
        shellBrick(args) {
            var msg = "Manual";
            if (args.length > 0) {
                msg += ", " + args[0];
            }
            _Kernel.krnTrapError(msg);
        }
        // Rolls a die of size args[0].
        shellRoll(args) {
            if (args.length == 0) { //If there's no arguments, we can't roll the die.
                _StdOut.putText("Usage: roll <integer>  Please supply an integer.");
            }
            else {
                var i = parseInt(args[0]);
                if (isNaN(i)) { //And we do need a valid integer
                    _StdOut.putText("Usage: roll <integer>  Please supply a valid integer.");
                }
                else { //If we've got our size, generate a random number between 1 and it.
                    _StdOut.putText("Rolling d" + i);
                    _StdOut.advanceLine();
                    _StdOut.putText("Result: " + (Math.floor(Math.random() * Math.floor(i)) + 1));
                }
            }
        }
        //there is a .01% chance to get the character kos-mos every time you summon a character in xenoblade 2. please god just give me some luck.
        shellKos(args) {
            if (Math.random() <= .0001) {
                if (_SarcasticMode) {
                    _StdOut.putText("HOLY FUCKING SHIT, GO BUY A LOTTERY TICKET");
                }
                else {
                    _StdOut.putText("You did it, you got KOS-MOS!");
                }
            }
            else {
                _StdOut.putText("You did not get KOS-MOS");
                if (_SarcasticMode) {
                    _StdOut.advanceLine();
                    _StdOut.putText("...Loser.");
                }
            }
        }
        // Formats the drive. The user has the option of "-quick" or "-full." Defaults to quick. The first format is forced to be a full format. Unusable while the CPU is executing something.
        shellFormat(args) {
            if (!_CPU.isExecuting) {
                _StdOut.putText("Formatting the disk...");
                _StdOut.advanceLine();
                _Kernel.krnFileIO(0, args);
            }
            else {
                _StdOut.putText("Currently executing programs. Please wait for completion before formatting.");
            }
        }
        // Creates a file with a filename the user specifies. No spaces are allowed in filenames.
        shellCreate(args) {
            if (args.length < 1) { // We need a filename.
                _StdOut.putText("Usage: create <string>  Please give a filename.");
            }
            else {
                if (args[0].includes("~") || args[0].includes("\\") || args[0].includes("/") || args[0].includes("?") || args[0].includes("|") || args[0].includes(":") || args[0].includes("*") || args[0].includes("<") || args[0].includes(">")) { // These are the restricted characters
                    if (_SarcasticMode) {
                        _StdOut.putText("You dumb fucking cretin, you fucking fool, absolute fucking buffoon, you bumbling idiot. Fuck you.");
                        _StdOut.advanceLine();
                    }
                    _StdOut.putText("Filename contains illegal characters. Do not include: ~\\/?|:*<>");
                }
                else { // If nothing is weird, create the file
                    _Kernel.krnFileIO(1, args);
                }
            }
        }
        // Renames the file named the first string to the second string.
        shellRename(args) {
            if (args.length < 2) { // We need a filename.
                _StdOut.putText("Usage: rename <string> <string>  Please give a filename and replacement filename.");
            }
            else {
                if (args[1].includes("~") || args[1].includes("\\") || args[1].includes("/") || args[1].includes("?") || args[1].includes("|") || args[1].includes(":") || args[1].includes("*") || args[1].includes("<") || args[1].includes(">")) { // These are the restricted characters
                    if (_SarcasticMode) {
                        _StdOut.putText("You dumb fucking cretin, you fucking fool, absolute fucking buffoon, you bumbling idiot. Fuck you.");
                        _StdOut.advanceLine();
                    }
                    _StdOut.putText("Filename contains illegal characters. Do not include: ~\\/?|:*<>");
                }
                else { // If nothing seems wrong, make the file.
                    _Kernel.krnFileIO(12, args);
                }
            }
        }
        // Makes an exact copy of the file with the given filename.
        shellCopy(args) {
            if (args.length < 1) { // We need a filename.
                _StdOut.putText("Usage: copy <string>  Please give a filename.");
            }
            else { // If we've got one, go for the copy.
                _Kernel.krnFileIO(13, args);
            }
        }
        // Writes whatever the user specifies as the 2nd+ argument as content to the file with the specified filename.
        shellWrite(args) {
            if (args.length < 2) { // We need a filename and contents.
                _StdOut.putText("Usage: write <string> <string> Please give both a filename and file contents.");
            }
            else {
                var pass = [args.shift(), args.shift()]; // We need to give the kernel an array of size 2, so we combine everything past args[1] into pass[1].
                while (args.length > 0) {
                    pass[1] = pass[1] + " " + args.shift();
                }
                _Kernel.krnFileIO(2, pass); // Then pass it into the kernel.
            }
        }
        // Returns the contents of the file with the filename the user specifies.
        shellRead(args) {
            if (args.length < 1) { // We need a filename.
                _StdOut.putText("Usage: read <string>  Please give a filename.");
            }
            else { // If we've got one, try to print the file.
                _Kernel.krnFileIO(3, args);
            }
        }
        // Lists all the files in the file directory. If "-l" is used, it will show all hidden (beginning with a ".") files, as well.
        shellList(args) {
            if (args.length < 1) { // We could or couldn't have an argument. If there's none, then default to a normal file list.
                _Kernel.krnFileIO(4, ["0"]);
            }
            else {
                if (args[0] == "-l") { // If there is an argument and it is "-l", then list in full
                    _Kernel.krnFileIO(4, ["1"]);
                }
                else { // Otherwise, default to the normal list.
                    _Kernel.krnFileIO(4, ["0"]);
                }
            }
        }
        // Deletes the file with the specified filename.
        shellDelete(args) {
            if (args.length < 1) { // We need a filename.
                _StdOut.putText("Usage: delete <string>  Please give a filename.");
            }
            else {
                if (args[0].includes("~") || args[0].includes("\\") || args[0].includes("/") || args[0].includes("?") || args[0].includes("|") || args[0].includes(":") || args[0].includes("*") || args[0].includes("<") || args[0].includes(">")) { // These are the restricted characters.
                    if (_SarcasticMode) {
                        _StdOut.putText("You really thought I'd let you delete system files? In my realm??? Nerd.");
                        _StdOut.advanceLine();
                    }
                    _StdOut.putText("Filename contains illegal characters. Do not include: ~\\/?|:*<>");
                }
                else {
                    _Kernel.krnFileIO(5, args);
                }
            }
        }
        // Sets the scheduler mode to whatever the user specifies of 3 modes: "rr" for Round Robin, "fcfs" for First Come First Serve, "priority" for Priority (non-preemptive).
        shellSetSchedule(args) {
            if (args.length < 1) { // There is no input
                _StdOut.putText("Usage: setschedule <rr|fcfs|priority>  Please choose a method.");
            }
            else if (args[0] == "rr" || args[0] == "fcfs" || args[0] == "priority") { // If the input is valid
                _Scheduler.mode = args[0];
                _StdOut.putText("Mode changed");
            }
            else { // There is input, but it is not one of the choices
                _StdOut.putText("Usage: setschedule <rr|fcfs|priority>  Please choose a valid method.");
            }
        }
        // Returns the current scheduler mode.
        shellGetSchedule(args) {
            switch (_Scheduler.mode) {
                case "rr":
                    _StdOut.putText("Scheduler mode: Round Robin.");
                    break;
                case "fcfs":
                    _StdOut.putText("Scheduler mode: First Come First Serve.");
                    break;
                case "priority":
                    _StdOut.putText("Scheduler mode: Priority.");
                    break;
                default:
                    _StdOut.putText("Scheduler mode unknown or improperly set.");
            }
        }
        // Returns the current scheduler mode.
        shellLanguage(args) {
            if (args.length < 2) {
            }
        }
    }
    TSOS.Shell = Shell;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=shell.js.map