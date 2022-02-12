export const getInitials = (name: string) => {
  if (!name.length) return null;
  for (let i = 0; i < name.length; i++) {
    if (name[i] !== " ") return name[i];
  }
  return null;
  // return name.split(" ").map(n => n[0] != " " ? n[0] : "").join("");

  // const rgx = new RegExp(/(\p{L}{1})\p{L}+/, 'gu');
  // let initials = [...name.matchAll(rgx)] || [];
  // return ((initials.shift()?.[1] || '') + (initials.pop()?.[1] || '')).toUpperCase();
};