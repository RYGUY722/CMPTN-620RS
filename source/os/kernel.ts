/* ------------
     Kernel.ts

     Routines for the Operating System, NOT the host.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {

    export class Kernel {
        //
        // OS Startup and Shutdown Routines
        //
        public krnBootstrap() {      // Page 8. {
            Control.hostLog("bootstrap", "host");  // Use hostLog because we ALWAYS want this, even if _Trace is off.

            // Initialize our global queues.
            _KernelInterruptQueue = new Queue();  // A (currently) non-priority queue for interrupt requests (IRQs).
            _KernelBuffers = new Array();         // Buffers... for the kernel.
            _KernelInputQueue = new Queue();      // Where device input lands before being processed out somewhere.

            // Initialize the console.
            _Console = new Console();             // The command line interface / console I/O device.
            _Console.init();

            // Initialize standard input and output to the _Console.
            _StdIn  = _Console;
            _StdOut = _Console;
			
			// Start the memory manager
			_MemoryManager = new MemoryManager();
			
			// Load the scheduler and its ready queue
			_Scheduler = new Scheduler();
			_Scheduler.init();
			_ReadyList = new Queue();

            // Load the Keyboard Device Driver
            this.krnTrace("Loading the keyboard device driver.");
            _krnKeyboardDriver = new DeviceDriverKeyboard();     // Construct it.
            _krnKeyboardDriver.driverEntry();                    // Call the driverEntry() initialization routine.
            this.krnTrace(_krnKeyboardDriver.status);

            // Load the Hard Disk Device Driver
            this.krnTrace("Loading the HDD device driver.");
            _krnHDDDriver = new DeviceDriverHardDisk();     // Construct it.
            _krnHDDDriver.driverEntry();                    // Call the driverEntry() initialization routine.
            this.krnTrace(_krnHDDDriver.status);

            //
            // ... more?
            //

            // Enable the OS Interrupts.  (Not the CPU clock interrupt, as that is done in the hardware sim.)
            this.krnTrace("Enabling the interrupts.");
            this.krnEnableInterrupts();

            // Launch the shell.
            this.krnTrace("Creating and Launching the shell.");
            _OsShell = new Shell();
            _OsShell.init();

            // Finally, initiate student testing protocol.
            if (_GLaDOS) {
                _GLaDOS.afterStartup();
            }
        }

        public krnShutdown() {
            this.krnTrace("begin shutdown OS");
            // TODO: Check for running processes.  If there are some, alert and stop. Else...
            // ... Disable the Interrupts.
            this.krnTrace("Disabling the interrupts.");
            this.krnDisableInterrupts();
            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            //
            // Unload the Device Drivers?
            // More?
            //
			
			_CPU.isExecuting = false; // Kill the lightshow
			
            this.krnTrace("end shutdown OS");
        }
		
		public krnProgramBreak() { //This method saves the PCB of a process and forces the CPU to stop executing.
			_ProcessList[_CurrentProcess].save();
			_CPU.isExecuting = false;
		}


        public krnOnCPUClockPulse() {
            /* This gets called from the host hardware simulation every time there is a hardware clock pulse.
               This is NOT the same as a TIMER, which causes an interrupt and is handled like other interrupts.
               This, on the other hand, is the clock pulse from the hardware / VM / host that tells the kernel
               that it has to look for interrupts and process them if it finds any.                          
            */

            // Check for an interrupt, if there are any. Page 560
            if (_KernelInterruptQueue.getSize() > 0) {
                // Process the first interrupt on the interrupt queue.
                // TODO (maybe): Implement a priority queue based on the IRQ number/id to enforce interrupt priority.
                var interrupt = _KernelInterruptQueue.dequeue();
                this.krnInterruptHandler(interrupt.irq, interrupt.params);
            } else if (_CPU.isExecuting) { // If there are no interrupts then run one CPU cycle if there is anything being processed.
				_CPU.cycle();
				_Scheduler.currentCycle++;
				if((_Scheduler.currentCycle>=_Scheduler.quantum) && (_Scheduler.mode=="rr")){ // Check if enough time has passed for the process to be switched and that our scheduler mode is preemptive (ie, round robin).
					_KernelInterruptQueue.enqueue(new Interrupt(SCHEDULER_IRQ, null));
				}
            } else {                       // If there are no interrupts and there is nothing being executed then just be idle.
                this.krnTrace("Idle");
            }
        }


        //
        // Interrupt Handling
        //
        public krnEnableInterrupts() {
            // Keyboard
            Devices.hostEnableKeyboardInterrupt();
            // Put more here.
        }

        public krnDisableInterrupts() {
            // Keyboard
            Devices.hostDisableKeyboardInterrupt();
            // Put more here.
        }

        public krnInterruptHandler(irq, params) {
            // This is the Interrupt Handler Routine.  See pages 8 and 560.
            // Trace our entrance here so we can compute Interrupt Latency by analyzing the log file later on. Page 766.
            this.krnTrace("Handling IRQ~" + irq);

            // Invoke the requested Interrupt Service Routine via Switch/Case rather than an Interrupt Vector.
            // TODO: Consider using an Interrupt Vector in the future.
            // Note: There is no need to "dismiss" or acknowledge the interrupts in our design here.
            //       Maybe the hardware simulation will grow to support/require that in the future.
            switch (irq) {
                case TIMER_IRQ:
                    this.krnTimerISR();               // Kernel built-in routine for timers (not the clock).
                    break;
                case KEYBOARD_IRQ:
                    _krnKeyboardDriver.isr(params);   // Kernel mode device driver
                    _StdIn.handleInput();
                    break;
				case PROGRAM_IRQ:                     // System call from a user program
					if(_CPU.Xreg == 1){
						_StdOut.putText(_CPU.Yreg.toString());
					}
					else if(_CPU.Xreg == 2){
						var addr = _CPU.Yreg;
						while(_MemoryAccessor.read(_ProcessList[_CurrentProcess].Segment, addr) != "00") {
							var lettercode = parseInt(_MemoryAccessor.read(_ProcessList[_CurrentProcess].Segment, addr), 16);
							_StdOut.putText(String.fromCharCode(lettercode));
							addr++;
						}
					}
					break;
				case SCHEDULER_IRQ:                   // Interrupt from the scheduler to begin or switch processes.
					this.krnDispatchNewProcess(_Scheduler.nextProcess());
					break;
                default:
                    this.krnTrapError("Invalid Interrupt Request. irq=" + irq + " params=[" + params + "]");
            }
        }

        public krnTimerISR() {
            // The built-in TIMER (not clock) Interrupt Service Routine (as opposed to an ISR coming from a device driver). {
            // Check multiprogramming parameters and enforce quanta here. Call the scheduler / context switch here if necessary.
            // Or do it elsewhere in the Kernel. We don't really need this.
        }

        //
        // System Calls... that generate software interrupts via tha Application Programming Interface library routines.
        //
        // Some ideas:
        // - ReadConsole
        // - WriteConsole
        // - CreateProcess
        // - ExitProcess
        // - WaitForProcessToExit
        // - CreateFile
        // - OpenFile
        // - ReadFile
        // - WriteFile
        // - CloseFile


        //
        // OS Utility Routines
        //
        public krnTrace(msg: string) {
             // Check globals to see if trace is set ON.  If so, then (maybe) log the message.
             if (_Trace) {
                if (msg === "Idle") {
                    // We can't log every idle clock pulse because it would quickly lag the browser quickly.
                    if (_OSclock % 10 == 0) {
                        // Check the CPU_CLOCK_INTERVAL in globals.ts for an
                        // idea of the tick rate and adjust this line accordingly.
                        Control.hostLog(msg, "OS");
                    }
                } else {
                    Control.hostLog(msg, "OS");
                }
             }
        }
		
		public krnFileIO(mode, args: string[]) { // This edits the file system in some way. The mode is a number, and the operations are mostly in the same order as in the shell.
			if(!_HDDReady && mode!=0) {
				_StdOut.putText("Disk not formatted. Please format disk first.");
			}
			else {
				switch (mode) { // 0 = format, 1 = create, 2 = write, 3 = view, 4 = list, 5 = delete, 6 = create silently, 7 = write direct, 8 = view direct, 9 = delete silently, 10 = find file, 11 = check file can fit on disk, 12 = rename, 13 = copy
					case 0:
						if(args[0] == "-full") {
							_krnHDDDriver.format(1);
						}
						else {
							_krnHDDDriver.format(0);
						}
						_StdOut.putText("Disk formatted.");
						_HDDReady = true;
						break;
					case 1: 
						if(args[0].length>(HDD_BLOCK_SIZE-4)) {
							_StdOut.putText("Filename too large or too many copies. Please use " + (HDD_BLOCK_SIZE-4) + " characters or less.");
							break;
						}
						if(_krnHDDDriver.findFile(args[0]) == "-1") {
							_krnHDDDriver.create(args[0]);
							_StdOut.putText("Created file "+args[0]);
						}
						else {
							_StdOut.putText("File "+args[0]+" already exists.");
							this.krnFileIO(1, [args[0]+"(1)"]);
						}
						break;
					case 2: 
						if(_krnHDDDriver.findFile(args[0]) == "-1") {
							_StdOut.putText("File not found. Please create " + args[0] + " or enter a valid filename.");
							break;
						}
						_krnHDDDriver.writePlain(args[0], args[1]);
						_StdOut.putText("Wrote to file "+args[0]+".");
						break;
					case 3: 
						if(_krnHDDDriver.findFile(args[0]) == "-1") {
							_StdOut.putText("File not found. Please create " + args[0] + " or enter a valid filename.");
							break;
						}
						_StdOut.putText(_krnHDDDriver.readPlain(args[0]));
						break;
					case 4: 
						_krnHDDDriver.list(parseInt(args[0]));
						break;
					case 5: 
						if(_krnHDDDriver.findFile(args[0]) == "-1") {
							_StdOut.putText("File not found. Please create " + args[0] + " or enter a valid filename.");
							break;
						}
						_krnHDDDriver.deleteFile(args[0]);
						_StdOut.putText("File "+args[0]+" deleted.");
						break;
					case 6:
						if(args[0].length>(HDD_BLOCK_SIZE-4)) {
							break;
						}
						if(_krnHDDDriver.findFile(args[0]) == "-1") {
							_krnHDDDriver.create(args[0]);
						}
						else {
							this.krnFileIO(1, [args[0]+"(1)"]);
						}
						break;
					case 7: 
						if(_krnHDDDriver.findFile(args[0]) == "-1") {
							break;
						}
						_krnHDDDriver.write(args[0], args[1]);
						break;
					case 8: 
						if(_krnHDDDriver.findFile(args[0]) == "-1") {
							break;
						}
						return _krnHDDDriver.read(args[0]);
						break;
					case 9: 
						if(_krnHDDDriver.findFile(args[0]) == "-1") {
							break;
						}
						_krnHDDDriver.deleteFile(args[0]);
						break;
					case 10:
						if(_krnHDDDriver.findFile(args[0]) == "-1") {
							return false;
							break;
						}
						return true;
						break;
					case 11:
						if(_krnHDDDriver.canFit(args[0])) {
							return true;
						}
						return false;
						break;
					case 12: 
						if(_krnHDDDriver.findFile(args[0]) != "-1") {
							if(args[1].length>(HDD_BLOCK_SIZE-4)) {
								_StdOut.putText("Filename too large or too many copies. Please use " + (HDD_BLOCK_SIZE-4) + " characters or less.");
								break;
							}
							else {
								_krnHDDDriver.rename(args[0], args[1]);
								_StdOut.putText("File "+args[0]+" renamed to "+args[1]+".");
								break;
							}
						}
						_StdOut.putText("File "+args[0]+" not found.");
						break;
					case 13: 
						if((args[0].length+3)>(HDD_BLOCK_SIZE-4)) {
							_StdOut.putText("Filename too large or too many copies. Please use " + (HDD_BLOCK_SIZE-4) + " characters or less.");
							break;
						}
						if(_krnHDDDriver.findFile(args[0]) == "-1") {
							_StdOut.putText("File "+args[0]+" not found.");
							break;
						}
						else {
							if(_krnHDDDriver.findFile(args[0]+"(1)") == "-1") {
								_krnHDDDriver.copy(args[0]);
								_StdOut.putText("File " + args[0] + " copied as " + args[0] + "(1).");
							}
							else{
								this.krnFileIO(13, [args[0]+"(1)"]);
							}
						}
						break;
						
					default:
						this.krnTrapError("Invalid File I/O operation. Mode = " + mode);
				}
			}
			Control.updateDiskDisplay();
		}

        public krnTrapError(msg) {
            Control.hostLog("OS ERROR - TRAP: " + msg);
			_StdOut.resetXY(); //Draw over the entire canvas with a filled blue rectangle
			var ctx = _DrawingContext;
			ctx.beginPath();
			ctx.fillStyle = "blue";
			ctx.fillRect(0, 0, _Canvas.width, _Canvas.height);
			ctx.stroke();
			_StdOut.putText("A fatal error has occured."); //Place error text on top
			_StdOut.advanceLine();
			_StdOut.putText("Error message:");
			_StdOut.advanceLine();
			_StdOut.putText(msg);
			_StdOut.advanceLine();
			_StdOut.putText("OntOS will now exit.");
			if(_SarcasticMode) { 
				_StdOut.advanceLine();
				_StdOut.putText("Siren has been deployed. Good luck.");
			}
            this.krnShutdown();
        }
		
		public krnDispatchNewProcess(pid) {
			if(pid!=-1) { // If the PID the scheduler returned was -1, then all processes are completed and we should not attempt to context switch or begin a process.
				_Kernel.krnTrace("Switching processes"); // Inform the user.
				
				if(_CurrentProcess>=0) { // Save the old data and change the process state, but only if we were already executing a process before.
					_ProcessList[_CurrentProcess].save();
					_ProcessList[_CurrentProcess].State = "ready";
				}
				
				if(_ProcessList[pid].Segment == -1) { // If the new process is not in memory yet,
					_Scheduler.rollProcess(_CurrentProcess, pid); // Roll out the last process and roll in the new one.
				}
				
				_CurrentProcess = pid; // Make sure the current process is equal to whatever the scheduler wants it to be,
				_ProcessList[_CurrentProcess].State = "running"; // and that its state is running.
				
				_CPU.load(); // Then, tell the CPU to load the data for the new process
			}
			_Scheduler.currentCycle = 0;
		}
    }
}
