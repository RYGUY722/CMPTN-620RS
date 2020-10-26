var TSOS;
(function (TSOS) {
    class Scheduler {
        constructor(quantum = DEFAULT_QUANTUM, cycleCounter = 0, currentIndex = 0) {
            this.quantum = quantum;
            this.cycleCounter = cycleCounter;
            this.currentIndex = currentIndex;
        }
        init() {
            _ResidentList.fill(-1);
        }
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
        freeSeg(segment) {
            if (_ResidentList[segment] != -1) {
                _ProcessList[_ResidentList[segment]].State = "terminated";
            }
            _ResidentList[segment] = -1;
            _MemoryManager.clearSeg(segment);
        }
        addProcess(pid) {
            _ResidentList[_ProcessList[pid].Segment] = pid;
            _ProcessList[pid].State = "waiting";
        }
        endProcess(pid) {
            _ResidentList[_ProcessList[pid].Segment] = -1;
            _ProcessList[pid].Segment = -1;
            _ProcessList[pid].State = "terminated";
            _ProcessList[pid].completed = true;
            _ProcessList[pid].save();
        }
        readyProcess(pid) {
            _ReadyList.push(pid);
            _ProcessList[pid].State = "ready";
        }
        nextProcess() {
            for (var i = this.currentIndex; i != this.currentIndex; i++) { //Iterate through the Ready List, starting at the current process, looking for the next process in the list
                if (i >= _ReadyList.length) { // If we're at the end of the list, loop around
                    i = 0;
                }
                if (_ReadyList[i] != -1) { // If the PID in the Ready List isn't -1 (no process), then we found the next process.
                    this.currentIndex = i;
                    return _ReadyList[i];
                }
            }
            return _ReadyList[currentIndex];
        }
    }
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=scheduler.js.map