/* ------------
     Control.ts

     Routines for the hardware simulation, NOT for our client OS itself.
     These are static because we are never going to instantiate them, because they represent the hardware.
     In this manner, it's A LITTLE BIT like a hypervisor, in that the Document environment inside a browser
     is the "bare metal" (so to speak) for which we write code that hosts our client OS.
     But that analogy only goes so far, and the lines are blurred, because we are using TypeScript/JavaScript
     in both the host and client environments.

     This (and other host/simulation scripts) is the only place that we should see "web" code, such as
     DOM manipulation and event handling, and so on.  (Index.html is -- obviously -- the only place for markup.)

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
//
// Control Services
//
var TSOS;
(function (TSOS) {
    class Control {
        static hostInit() {
            // This is called from index.html's onLoad event via the onDocumentLoad function pointer.
            // Get a global reference to the canvas.  TODO: Should we move this stuff into a Display Device Driver?
            _Canvas = document.getElementById('display');
            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext("2d");
            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            TSOS.CanvasTextFunctions.enable(_DrawingContext); // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun, so we'll keep it.
            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            document.getElementById("taHostLog").value = "";
            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            document.getElementById("btnStartOS").focus();
            // Check for our testing and enrichment core, which
            // may be referenced here (from index.html) as function Glados().
            if (typeof Glados === "function") {
                // function Glados() is here, so instantiate Her into
                // the global (and properly capitalized) _GLaDOS variable.
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
        }
        static hostLog(msg, source = "?") {
            // Note the OS CLOCK.
            var clock = _OSclock;
            // Note the REAL clock in milliseconds since January 1, 1970.
            var now = new Date().getTime();
            // Build the log string.
            var str = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now + " })" + "\n";
            // Update the log console.
            var taLog = document.getElementById("taHostLog");
            taLog.value = str + taLog.value;
            // TODO in the future: Optionally update a log database or some streaming service.
        }
        //
        // Host Events
        //
        static hostBtnStartOS_click(btn) {
            // Disable the (passed-in) start button...
            btn.disabled = true;
            // .. enable the Halt and Reset buttons ...
            document.getElementById("btnHaltOS").disabled = false;
            document.getElementById("btnReset").disabled = false;
            document.getElementById("btnModeChange").disabled = false;
            // .. set focus on the OS console display ...
            document.getElementById("display").focus();
            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new TSOS.Cpu(); // Note: We could simulate multi-core systems by instantiating more than one instance of the CPU here.
            _CPU.init(); // There's more to do, like dealing with scheduling and such, but this would be a start. Pretty cool.
            _Memory = new TSOS.Memory();
            _Memory.init();
            _MemoryAccessor = new TSOS.MemoryAccessor();
            _MemoryAccessor.init();
            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(TSOS.Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new TSOS.Kernel();
            _Kernel.krnBootstrap(); // _GLaDOS.afterStartup() will get called in there, if configured.
        }
        static hostBtnHaltOS_click(btn) {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");
            // Call the OS shutdown routine.
            _Kernel.krnShutdown();
            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        }
        static hostBtnReset_click(btn) {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload(true);
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        }
        static hostBtnModeChange_click(btn) {
            if (_hardwareClockID !== -1) { //If there is currently a clock pulse, then we're in normal mode.
                Control.hostLog("Switching to Single-Step Mode", "host");
                // Stop the interval that's simulating our clock pulse.
                clearInterval(_hardwareClockID);
                _hardwareClockID = -1; //To keep track that there is no longer a clock pulse, I set this to -1.
                // Allow the user to click the step button
                document.getElementById("btnStep").disabled = false;
                // And display that we are now in Single-Step Mode.
                document.getElementById("btnModeChange").value = "Mode: Single-Step";
            }
            else { //Otherwise, we need to switch back to normal mode.
                Control.hostLog("Switching to Normal Mode", "host");
                // Reset our clock pulse.
                _hardwareClockID = setInterval(TSOS.Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
                // Disable the step button again
                document.getElementById("btnStep").disabled = true;
                // And display that we are now back in Normal Mode.
                document.getElementById("btnModeChange").value = "Mode: Normal";
            }
        }
        static hostBtnStep_click(btn) {
            Control.hostLog("Manually pulsing clock", "host");
            TSOS.Devices.hostClockPulse();
        }
        static updateDisplays() {
            Control.updateDate();
            Control.updateMemory();
            Control.updateCPUStatus();
            Control.updatePCBStatus();
        }
        static updateDate() {
            var d = new Date();
            document.getElementById("dateIn").innerHTML = d.toLocaleString();
        }
        static updateMemory() {
            var table = document.getElementById("tbMemory");
            var newtab = document.createElement('tbody');
            for (var i = 0; i < MEM_MAXIMUM_SIZE; i += 8) {
                var row = newtab.insertRow(-1);
                var addrstr = (i % MEM_SEGMENT_SIZE).toString(16).toUpperCase(); // To display the memory address, I turn i into a hexadecimal string. For clarity, I broke it up into a new variable.
                while (addrstr.length < 3) { // To make it look good, I want all addresses to be the same size. I didn't want to do all that in a single line, this is clearer.
                    addrstr = "0" + addrstr;
                }
                row.insertCell(-1).innerHTML = (Math.floor(i / MEM_SEGMENT_SIZE) + "x" + addrstr);
                for (var c = 0; c < 8; c++) {
                    var memval = _MemoryAccessor.read(i + c);
                    memval = memval.toString();
                    row.insertCell(-1).innerHTML = memval.toUpperCase();
                }
            }
            table.replaceChild(newtab, table.tBodies[0]);
        }
        static updateCPUStatus() {
            var table = document.getElementById("tbCPU");
            var row = table.rows[1];
            row.cells[0].innerHTML = _CPU.isExecuting.toString();
            row.cells[1].innerHTML = _CPU.PC.toString(16).toUpperCase();
            row.cells[2].innerHTML = _MemoryAccessor.read(_CPU.PC);
            row.cells[3].innerHTML = _CPU.Acc.toString(16).toUpperCase();
            row.cells[4].innerHTML = _CPU.Xreg.toString(16).toUpperCase();
            row.cells[5].innerHTML = _CPU.Yreg.toString(16).toUpperCase();
            row.cells[6].innerHTML = _CPU.Zflag.toString();
        }
        static updatePCBStatus() {
            var table = document.getElementById("tbPCB");
            while (_ProcessCounter >= table.rows.length) {
                var newrow = table.insertRow(-1);
                for (var i = 0; i < 8; i++) {
                    newrow.insertCell(-1);
                }
            }
            for (var i = 0; i < _ProcessCounter; i++) {
                var row = table.rows[(i + 1)];
                row.cells[0].innerHTML = _ProcessList[i].PID.toString();
                row.cells[1].innerHTML = _ProcessList[i].PC.toString(16).toUpperCase();
                row.cells[2].innerHTML = _ProcessList[i].Acc.toString(16).toUpperCase();
                row.cells[3].innerHTML = _ProcessList[i].Xreg.toString(16).toUpperCase();
                row.cells[4].innerHTML = _ProcessList[i].Yreg.toString(16).toUpperCase();
                row.cells[5].innerHTML = _ProcessList[i].Zflag.toString();
                row.cells[6].innerHTML = _ProcessList[i].State.toString();
                row.cells[7].innerHTML = _ProcessList[i].completed.toString();
            }
        }
    }
    TSOS.Control = Control;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=control.js.map