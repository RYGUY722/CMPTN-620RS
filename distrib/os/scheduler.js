var TSOS;
(function (TSOS) {
    class Scheduler {
        constructor(quantum = 3) {
            this.quantum = quantum;
        }
        init() { }
        isFull() {
            for (var i = 0; i <= MEM_SEGMENTS; i++) {
                if (_ReadyList[i] == -1) {
                    return false;
                }
            }
            return true;
        }
        getNextSeg() {
            for (var i = 0; i <= MEM_SEGMENTS; i++) {
                if (_ReadyList[i] == -1) {
                    return i;
                }
            }
            return -1;
        }
        addProcess() {
        }
        endProcess(pid) {
            _ProcessList[pid].Segment = -1;
        }
    }
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=scheduler.js.map