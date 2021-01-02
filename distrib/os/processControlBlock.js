var TSOS;
(function (TSOS) {
    class ProcessControlBlock {
        constructor(PID = _ProcessCounter, Segment = -1, Location = "N/A", // N/A, Memory, Storage, Deleted
        State = "new", // New, waiting, ready, running, terminated
        PC = 0, Acc = 0, Xreg = 0, Yreg = 0, Zflag = 0, priority = 16, // 0 is the highest priority, 31 is the lowest.
        completed = false, rewrite = false) {
            this.PID = PID;
            this.Segment = Segment;
            this.Location = Location;
            this.State = State;
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.priority = priority;
            this.completed = completed;
            this.rewrite = rewrite;
        }
        init() { }
        save() {
            this.PC = _CPU.PC;
            this.Acc = _CPU.Acc;
            this.Xreg = _CPU.Xreg;
            this.Yreg = _CPU.Yreg;
            this.Zflag = _CPU.Zflag;
        }
    }
    TSOS.ProcessControlBlock = ProcessControlBlock;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=processControlBlock.js.map