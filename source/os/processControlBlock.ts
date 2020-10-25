module TSOS {

    export class ProcessControlBlock {

		constructor(public PID: number = _ProcessCounter,
					public Segment: number = -1,
					public PC: number = 0,
                    public Acc: number = 0,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public completed: boolean = false,
					public rewrite: boolean = false) {}
		
        public init(): void {}
		
		public save(): void{
			this.PC = _CPU.PC;
			this.Acc = _CPU.Acc;
			this.Xreg = _CPU.Xreg;
			this.Yreg = _CPU.Yreg;
			this.Zflag = _CPU.Zflag;
		}
		
	}
}