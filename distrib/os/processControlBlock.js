var TSOS;
(function (TSOS) {
    class ProcessControlBlock {
        constructor(PID = _ProcessCounter, PC = 0, Acc = 0, Xreg = 0, Yreg = 0, Zflag = 0, completed = false, rewrite = false) {
            this.PID = PID;
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
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