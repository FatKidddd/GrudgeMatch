export const getInitials = (name: string) => {
  return name.split(" ").map(n => n[0] != " " ? n[0] : "").join("");
  // const rgx = new RegExp(/(\p{L}{1})\p{L}+/, 'gu');
  // let initials = [...name.matchAll(rgx)] || [];
  // return ((initials.shift()?.[1] || '') + (initials.pop()?.[1] || '')).toUpperCase();
};