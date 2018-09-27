/**
 * 二分法查找数组某个值的位置
 * @param {array} arr
 * @param {string | number} data
 * @returns
 */
function dichotomy(arr, data) {
  //执行次数
  let count = 0;
  let end = arr.length - 1;
  let start = 0;
  while (start <= end) {
    count++;
    let mid = Math.floor((end + start) / 2);
    if (arr[mid] < data) {
      start = mid + 1;
    } else if (arr[mid] > data) {
      end = mid - 1;
    } else {
      console.log('执行了' + count + '次');
      return mid;
    }
  }
  return -1;
}
var arr = [];
console.time();
for (let i = 0; i <= 100000000; i++) {
  arr[i] = i;
}
console.timeEnd();
console.time();
console.log(dichotomy(arr, 9), 'dichotomy');
console.timeEnd();
console.time();
console.log(arr.indexOf(9), 'indexOf');
console.timeEnd();
//比较了一下，js内置的indexOf，目标查找的索引越小的执行时间越快。
//但是随着数字越大，就变慢了很多，比二分法差
//所以在数据量大的时候还是建议使用二分法，如果数据比较少，indexOf更好（按照上面的测试，大于20万长度的数组就是二分法更胜一筹了）。
//但是前端的数据处理基本都不会超过10w数组，反正我没遇过，所以直接用indexOf没什么大问题，反而更佳，因为数组小。
