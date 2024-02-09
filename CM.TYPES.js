Object.values(CM.TYPES).reduce((types,type)=>{
  type.groupName='';//fix filter
  types[type.id]=type;
  return types;
},CM.TYPES);
