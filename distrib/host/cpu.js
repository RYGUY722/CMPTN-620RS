/* ------------
     CPU.ts

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var TSOS;
(function (TSOS) {
    class Cpu {
        constructor(PC = 0, Acc = 0, Xreg = 0, Yreg = 0, Zflag = 0, isExecuting = false) {
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
        }
        init() {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        }
        load() {
            this.PC = _ProcessList[_CurrentProcess].PC;
            this.Acc = _ProcessList[_CurrentProcess].Acc;
            this.Xreg = _ProcessList[_CurrentProcess].Xreg;
            this.Yreg = _ProcessList[_CurrentProcess].Yreg;
            this.Zflag = _ProcessList[_CurrentProcess].Zflag;
        }
        execute(pid) {
            _CurrentProcess = pid;
            this.load();
            this.isExecuting = true;
        }
        cycle() {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            switch (_MemoryAccessor.read(_ProcessList[_CurrentProcess].Segment, this.PC)) { //Retrieve the next instruction from memory, and act based on it.
                case ("A9"): { // LDA: Load constant
                    this.PC++; // Advance the program counter once,
                    var trans = parseInt(_MemoryAccessor.read(_ProcessList[_CurrentProcess].Segment, this.PC), 16); // ...Retrieve the next value from memory and translate it from a string hex value to a base 10 int (This variable is optional, but used for clarity).
                    this.Acc = trans; // ...Then set the accumulator to new value.
                    break;
                }
                case ("AD"): { // LDA: Load from memory
                    this.PC++; // Advance to the next memory location
                    var addr = _MemoryAccessor.read(_ProcessList[_CurrentProcess].Segment, this.PC); // Retrieve the byte at this location
                    this.PC++; // Memory locations are 2 bytes long, so advance again
                    addr = _MemoryAccessor.read(_ProcessList[_CurrentProcess].Segment, this.PC) + addr; // Addresses are written in Little Endian style, so second byte before the first.
                    // We are left with a 2 byte long memory address, expressed as a hexadecimal string.
                    this.Acc = parseInt(_MemoryAccessor.read(_ProcessList[_CurrentProcess].Segment, parseInt(addr, 16)), 16); // So, we translate it back to a base 10 number, and place that byte of memory into the accumulator.
                    break;
                }
                case ("8D"): { // STA: Store accumulator
                    this.PC++; // The process of retrieving and translating the memory address is identical to opcode AD, so see there for more details.
                    var addr = _MemoryAccessor.read(_ProcessList[_CurrentProcess].Segment, this.PC);
                    this.PC++;
                    addr = _MemoryAccessor.read(_ProcessList[_CurrentProcess].Segment, this.PC) + addr;
                    var hexAcc = this.Acc.toString(16); // All bytes in memory are written in hexadecimal, so we need to translate the accumulator's value to hex first.
                    if (hexAcc.length < 2) { // When the accumulator value is under 16, it will simply write 1 digit. All memory values are 2 characters long, so we need to add a starting 0.
                        hexAcc = "0" + hexAcc;
                    }
                    _MemoryAccessor.write(_ProcessList[_CurrentProcess].Segment, parseInt(addr, 16), hexAcc); // The only difference is that we write the current accumulator to the targeted address, rather than placing the value from memory into the accumulator.
                    break;
                }
                case ("6D"): { // ADC: Add a value from memory to the accumulator.
                    this.PC++; // The process of retrieving and translating the memory address is identical to opcode AD, so see there for more details.
                    var addr = _MemoryAccessor.read(_ProcessList[_CurrentProcess].Segment, this.PC);
                    this.PC++;
                    addr = _MemoryAccessor.read(_ProcessList[_CurrentProcess].Segment, this.PC) + addr;
                    var val = parseInt(_MemoryAccessor.read(_ProcessList[_CurrentProcess].Segment, parseInt(addr, 16)), 16); // Retrieve the value from the memory as a base 10 integer.
                    this.Acc = (this.Acc + val) % 256; // The accumulator is a one byte value, so it will wrap around if it goes over 255.
                    break;
                }
                case ("A2"): { // LDX: Load X with a constant
                    this.PC++; // This process is identical to opcode A9, except it loads the value to the X register.
                    var trans = parseInt(_MemoryAccessor.read(_ProcessList[_CurrentProcess].Segment, this.PC), 16);
                    this.Xreg = trans;
                    break;
                }
                case ("AE"): { // LDX: Load X from memory
                    this.PC++; // This process is identical to opcode AD, except it loads the value to the X register.
                    var addr = _MemoryAccessor.read(_ProcessList[_CurrentProcess].Segment, this.PC);
                    this.PC++;
                    addr = _MemoryAccessor.read(_ProcessList[_CurrentProcess].Segment, this.PC) + addr;
                    this.Xreg = parseInt(_MemoryAccessor.read(_ProcessList[_CurrentProcess].Segment, parseInt(addr, 16)), 16);
                    break;
                }
                case ("A0"): { // LDY: Load Y with a constant
                    this.PC++; // This process is identical to opcode A9 and A2, except it loads the value to the Y register.
                    var trans = parseInt(_MemoryAccessor.read(_ProcessList[_CurrentProcess].Segment, this.PC), 16);
                    this.Yreg = trans;
                    break;
                }
                case ("AC"): { // LDY: Load Y from memory
                    this.PC++; // This process is identical to opcode AD and AE, except it loads the value to the Y register.
                    var addr = _MemoryAccessor.read(_ProcessList[_CurrentProcess].Segment, this.PC);
                    this.PC++;
                    addr = _MemoryAccessor.read(_ProcessList[_CurrentProcess].Segment, this.PC) + addr;
                    this.Yreg = parseInt(_MemoryAccessor.read(_ProcessList[_CurrentProcess].Segment, parseInt(addr, 16)), 16);
                    break;
                }
                case ("EA"): { // NOP: No operation
                    break;
                }
                case ("00"): { // BRK: Program break
                    _Scheduler.endProcess(_CurrentProcess); // Tell the scheduler that the process is done now.
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(SCHEDULER_IRQ, null)); // Then log an interrupt for the scheduler to find a new process for us.
                    break;
                }
                case ("EC"): { // CPX: Compare a memory value to X
                    this.PC++; // The process of retrieving and translating the memory address is identical to opcode AD, AE, and AC, so see there for more details.
                    var addr = _MemoryAccessor.read(_ProcessList[_CurrentProcess].Segment, this.PC);
                    this.PC++;
                    addr = _MemoryAccessor.read(_ProcessList[_CurrentProcess].Segment, this.PC) + addr;
                    var compval = parseInt(_MemoryAccessor.read(_ProcessList[_CurrentProcess].Segment, parseInt(addr, 16)), 16); // Store the value retrieved from memory.
                    if (this.Xreg == compval) { // If the value is the same as the X register, set the Z flag to 1.
                        this.Zflag = 1;
                    }
                    else { // Otherwise, set it to 0.
                        this.Zflag = 0;
                    }
                    break;
                }
                case ("D0"): { // BNE: Branch on 0
                    this.PC++;
                    if (this.Zflag == 0) {
                        var move = parseInt(_MemoryAccessor.read(_ProcessList[_CurrentProcess].Segment, this.PC), 16);
                        this.PC = (this.PC + move) % 256; // The program counter is a 1 byte value, so it will wrap upon hitting 256.
                        //this.PC--; // PC increments at the end of this switch statement, so we need to account for that in order to start on the desired value next cycle.
                        /*
                        I'll be totally honest... I have no clue why this is the way it is. Logically, I should have to account for the incrementation of the PC.
                        However, this way works. I don't mean in a "yeah just throw some duct tape on there, it'll be fine" way of it works, I mean it works totally correct as is.
                        Attempting to change it, in fact, breaks it. Perhaps my math is wrong, or maybe even the program I'm testing with (the GLaDOS iP2 testing program) is wrong or something.
                        I really don't know. What I do know is that this is *functionally* the correct solution, even if it doesn't make logical sense to me.
                        */
                    }
                    break;
                }
                case ("EE"): { // INC: Increment target byte
                    this.PC++; // The process of retrieving and translating the memory address is identical to opcode AD, AE, and AC, so see there for more details.
                    var addr = _MemoryAccessor.read(_ProcessList[_CurrentProcess].Segment, this.PC);
                    this.PC++;
                    addr = _MemoryAccessor.read(_ProcessList[_CurrentProcess].Segment, this.PC) + addr;
                    var val = parseInt(_MemoryAccessor.read(_ProcessList[_CurrentProcess].Segment, parseInt(addr, 16)), 16); // Retrieve the value as a base 10 number.
                    val = (val + 1) % 256; // Add 1 to the value, but wrap around since it is only a 1 byte value
                    var hexval = val.toString(16); // This is the same code as in opcode 8D, and for the same reason.
                    if (hexval.length < 2) {
                        hexval = "0" + hexval;
                    }
                    _MemoryAccessor.write(_ProcessList[_CurrentProcess].Segment, (parseInt(addr, 16)), hexval); //Write the translated string back into memory.
                    break;
                }
                case ("FF"): { // SYS: Calls an interrupt for the next cycle based on the value in the X register.
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(PROGRAM_IRQ, null));
                    break;
                }
                default: {
                    _Kernel.krnTrace("Opcode not recognized");
                }
            }
            this.PC = (this.PC + 1) % 256; // Increment to the next part of memory (PC is a 1 byte value).
        }
    }
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=cpu.js.map