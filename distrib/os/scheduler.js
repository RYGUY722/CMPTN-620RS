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
            if (pid == _CurrentProcess) {
                _CurrentProcess = -1;
            }
        }
        readyProcess(pid) {
            _ReadyList.enqueue(pid);
            _ProcessList[pid].State = "ready";
        }
        nextProcess() {
            if (!_ReadyList.isEmpty()) { // If the Ready List contains more PIDs, then we need to get the next one.
                if (_CurrentProcess >= 0) { // When a process is ended, the Current Process is set to -1. If it isn't ended, it needs to be placed back on the end of the queue.
                    _ReadyList.enqueue(_CurrentProcess);
                }
                return _ReadyList.dequeue(); // To get the next queue item, we simply call dequeue.
            }
            else { // If the Ready List is empty, then 1 of 2 cases is true: Either only 1 process is running, or all processes are done.
                if (_CurrentProcess == -1) { // So let's check the Current Process ID to see which it is. If it's -1, then all processes are done, so we need to shutdown.
                    _Kernel.krnTrace("All processes complete");
                    _CPU.isExecuting = false;
                }
                return _CurrentProcess; // We need to have a return value no matter what, so return the current PID to the dispatcher. If it's -1, it will ignore it.
            }
        }
    }
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=scheduler.js.map