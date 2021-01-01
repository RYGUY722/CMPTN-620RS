/* ------------
   Queue.ts

   A simple Queue, which is really just a dressed-up JavaScript Array.
   See the JavaScript Array documentation at
   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
   Look at the push and shift methods, as they are the least obvious here.

   ------------ */

module TSOS {
    export class Queue {
        constructor(public q = new Array()) {
        }

        public getSize() {
            return this.q.length;
        }

        public isEmpty(){
            return (this.q.length == 0);
        }
		
		public includes(value) {
			return this.q.includes(value);
		}

        public enqueue(element) {
            this.q.push(element);
        }

        public dequeue() {
            var retVal = null;
            if (this.q.length > 0) {
                retVal = this.q.shift();
            }
            return retVal;
        }
		
		public prioritySort(l, r) { // This sorts the queue by a priority in the _ProcessList. Only meant to be used by the _ReadyList
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

        public toString() {
            var retVal = "";
            for (var i in this.q) {
                retVal += "[" + this.q[i] + "] ";
            }
            return retVal;
        }
		
		private swap(l, r){ // Perhaps this shouldn't be here, but this is quicksort code, repurposed into my prioritysort.
			var temp = this.q[l];
			this.q[l] = this.q[r];
			this.q[r] = temp;
		}
		
		private partition(l, r) {
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
}
