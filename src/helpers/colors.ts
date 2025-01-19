const colorClasses = [
  'bg-gray-500 text-white',
  'bg-pink-500 text-white',
  'bg-red-500 text-white',
  'bg-blue-500 text-white',
  'bg-purple-500 text-white',
  'bg-yellow-500 text-black',
  'bg-green-500 text-white',
  'bg-indigo-500 text-white',
];

export const determineColorClass = (inputString: String) => {
  // DJB2 hash function
  let hash = 5381;
  for (let i = 0; i < inputString.length; i++) {
    hash = (hash * 33) ^ inputString.charCodeAt(i);
  }
  hash = hash >>> 0; // Ensure positive integer

  const index = hash % colorClasses.length;
  return colorClasses[index];
};
