var TSOS;
(function (TSOS) {
    class Scheduler {
        constructor(quantum = DEFAULT_QUANTUM, cycleCounter = 0, currentIndex = 0) {
            this.quantum = quantum;
            this.cycleCounter = cycleCounter;
            this.currentIndex = currentIndex;
        }
        init() { }
        isFull() {
            for (var i = 0; i <= MEM_SEGMENTS; i++) {
                if (_ResidentList[i] == -1) {
                    return false;
                }
            }
            return true;
        }
        getNextFreeSeg() {
            for (var i = 0; i <= MEM_SEGMENTS; i++) {
                if (_ResidentList[i] == -1) {
                    return i;
                }
            }
            return -1;
        }
        addProcess() {
            for (var i = 0; i <= MEM_SEGMENTS; i++) {
                if (_ResidentList[i] == -1) {
                    return i;
                }
            }
            return -1;
        }
        endProcess(pid) {
            _ResidentList[_ProcessList[pid].Segment] = -1;
            _ProcessList[pid].Segment = -1;
            _ProcessList[pid].State = "terminated";
            _ProcessList[pid].completed = false;
        }
        readyProcess(pid) {
            _ReadyList.push(pid);
            _ProcessList[pid].State = "ready";
        }
        nextProcess() {
            _Kernel.krnTrace("Switching processes");
            var lastPID = _CurrentProcess;
            for (var i = this.currentIndex; i != this.currentIndex; i++) { //Iterate through the Ready List, starting at the current process, looking for the next process in the list
                if (i >= _ReadyList.length) { // If we're at the end of the list, loop around
                    i = 0;
                }
                if (_ReadyList[i] != -1) { // If the PID in the Ready List isn't -1 (no process), then we found the next process.
                    this.currentIndex = i;
                    _CurrentProcess = _ReadyList[i];
                }
            }
            if (_CurrentProcess != lastPID) { // If the process changed, then we need to context switch.
                _ProcessList[lastPID].save();
                _ProcessList[lastPID].State = "ready";
                _ProcessList[_CurrentProcess].State = "running";
            }
        }
    }
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=scheduler.js.map