/* ------------
   Queue.ts

   A simple Queue, which is really just a dressed-up JavaScript Array.
   See the JavaScript Array documentation at
   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
   Look at the push and shift methods, as they are the least obvious here.

   ------------ */
var TSOS;
(function (TSOS) {
    class Queue {
        constructor(q = new Array()) {
            this.q = q;
        }
        getSize() {
            return this.q.length;
        }
        isEmpty() {
            return (this.q.length == 0);
        }
        includes(value) {
            return this.q.includes(value);
        }
        enqueue(element) {
            this.q.push(element);
        }
        dequeue() {
            var retVal = null;
            if (this.q.length > 0) {
                retVal = this.q.shift();
            }
            return retVal;
        }
        prioritySort(l, r) {
            var index;
            if (this.q.length > 1) {
                index = this.partition(l, r);
                if (l < index - 1) {
                    this.prioritySort(l, index - 1);
                }
                if (index < r) {
                    this.prioritySort(index, r);
                }
            }
        }
        toString() {
            var retVal = "";
            for (var i in this.q) {
                retVal += "[" + this.q[i] + "] ";
            }
            return retVal;
        }
        swap(l, r) {
            var temp = this.q[l];
            this.q[l] = this.q[r];
            this.q[r] = temp;
        }
        partition(l, r) {
            var pivot = _ProcessList[this.q[Math.floor((r + l) / 2)]].priority;
            var i = l;
            var j = r;
            while (i <= j) {
                while (_ProcessList[this.q[i]].priority < pivot) {
                    i++;
                }
                while (_ProcessList[this.q[j]].priority > pivot) {
                    j--;
                }
                if (i <= j) {
                    this.swap(i, j);
                    i++;
                    j--;
                }
            }
            return i;
        }
    }
    TSOS.Queue = Queue;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=queue.js.map