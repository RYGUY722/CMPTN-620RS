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
			
			// Load the scheduler
			_Scheduler = new Scheduler();
			_Scheduler.init();

            // Load the Keyboard Device Driver
            this.krnTrace("Loading the keyboard device driver.");
            _krnKeyboardDriver = new DeviceDriverKeyboard();     // Construct it.
            _krnKeyboardDriver.driverEntry();                    // Call the driverEntry() initialization routine.
            this.krnTrace(_krnKeyboardDriver.status);

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
				if(_Scheduler.currentCycle>=_Scheduler.quantum){ // Check if enough time has passed for the process to be switched
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
						while(_MemoryAccessor.read(addr) != "00") {
							var lettercode = parseInt(_MemoryAccessor.read(addr), 16);
							_StdOut.putText(String.fromCharCode(lettercode));
							addr++;
						}
					}
					break;
				case SCHEDULER_IRQ:                   // Interrupt from the scheduler to switch processes.
					krnDispatchNewProcess(_Scheduler.nextProcess());
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
			_Kernel.krnTrace("Switching processes"); // Inform the user.
			if(_CurrentProcess!=pid) { // If the next process is different from the current one, then we need to context switch.
				_ProcessList[_CurrentProcess].save();
				_ProcessList[_CurrentProcess].State = "ready";
				_CurrentProcess = pid;
				_ProcessList[_CurrentProcess].State = "running";
			}
			_CPU.load(); // Then, tell the CPU to load the data for the new process
			_Scheduler.currentCycle = 0;
		}
    }
}
