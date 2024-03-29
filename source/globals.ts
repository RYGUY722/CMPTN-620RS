/* ------------
   Globals.ts

   Global CONSTANTS and _Variables.
   (Global over both the OS and Hardware Simulation / Host.)

   This code references page numbers in our text book:
   Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
   ------------ */

//
// Global CONSTANTS (TypeScript 1.5 introduced const. Very cool.)
//
const APP_NAME: string    = "OntOS";   // A third of the Trinity
const APP_VERSION: string = "20.X.1";   // The year is 20XX, everyone plays Fox...

const CPU_CLOCK_INTERVAL: number = 100;   // This is in ms (milliseconds) so 1000 = 1 second.
const DEFAULT_QUANTUM: number = 6; // The default time each process gets to run.

const MEM_SEGMENT_SIZE: number = 256; // The size of a memory segment code is allowed to occupy.
const MEM_SEGMENTS: number = 3; // Please place the number of desired memory segments as the number within this constant.
const MEM_MAXIMUM_SIZE: number = MEM_SEGMENT_SIZE*MEM_SEGMENTS; // The full memory size

const HDD_TRACKS: number = 3; // These define the size of the Disk.
const HDD_SECTORS: number = 7;
const HDD_BLOCKS: number = 7;
const HDD_BLOCK_SIZE: number = 64;

const TIMER_IRQ: number = 0;  // Pages 23 (timer), 9 (interrupts), and 561 (interrupt priority).
                              // NOTE: The timer is different from hardware/host clock pulses. Don't confuse these.
const KEYBOARD_IRQ: number = 1;
const PROGRAM_IRQ: number = 2;
const SCHEDULER_IRQ: number = 3;


//
// Global Variables
// TODO: Make a global object and use that instead of the "_" naming convention in the global namespace.
//

// Hardware
var _CPU: TSOS.Cpu;  // Utilize TypeScript's type annotation system to ensure that _CPU is an instance of the Cpu class.
var _Memory: TSOS.Memory;
var _MemoryAccessor: TSOS.MemoryAccessor;

// Software
var _MemoryManager:any=null;

var _Scheduler:any=null;
var _ProgramLanguage: string = "mc"; // Available languages: "mc" = Machine Code (normal), "asm" = Assembly

var _OSclock: number = 0;  // Page 23.

var _Mode: number = 0;     // (currently unused)  0 = Kernel Mode, 1 = User Mode.  See page 21.

var _HDDReady: boolean = false;

var _Canvas: HTMLCanvasElement;          // Initialized in Control.hostInit().
var _DrawingContext: any;                // = _Canvas.getContext("2d");  // Assigned here for type safety, but re-initialized in Control.hostInit() for OCD and logic.
var _DefaultFontFamily: string = "sans"; // Ignored, I think. The was just a place-holder in 2008, but the HTML canvas may have use for it.
var _DefaultFontSize: number = 13;
var _FontHeightMargin: number = 4;       // Additional space added to font size when advancing a line.

var _Trace: boolean = true;              // Default the OS trace to be on.

// The OS Kernel and its queues.
var _Kernel: TSOS.Kernel;
var _KernelInterruptQueue: TSOS.Queue = null;
var _KernelInputQueue: TSOS.Queue = null; 
var _KernelBuffers = null; 

// Processes
var _ProcessCounter: number = 0;
var _CurrentProcess: number = -1;
var _ProcessList: TSOS.ProcessControlBlock[] = new Array();
var _ResidentList: number[] = new Array(MEM_SEGMENTS);
var _ReadyList: TSOS.Queue = null;
var _LoadedList: number[] = new Array();

// Standard input and output
var _StdIn:  TSOS.Console = null; 
var _StdOut: TSOS.Console = null;

// UI
var _Console: TSOS.Console;
var _OsShell: TSOS.Shell;

// At least this OS is not trying to kill you. (Yet.)
var _SarcasticMode: boolean = false;

// Global Device Driver Objects - page 12
var _krnKeyboardDriver: TSOS.DeviceDriverKeyboard  = null;
var _krnHDDDriver: TSOS.DeviceDriverHardDisk  = null;

var _hardwareClockID: number = null;

// For testing (and enrichment)...
var Glados: any = null;  // This is the function Glados() in glados-ip*.js http://alanclasses.github.io/TSOS/test/ .
var _GLaDOS: any = null; // If the above is linked in, this is the instantiated instance of Glados.

var onDocumentLoad = function() {
	TSOS.Control.hostInit();
};
