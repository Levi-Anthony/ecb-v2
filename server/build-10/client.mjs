import postgres from '../../tests/build-10/node_modules/postgres/src/index.js';
export function connect(config, role) {
  const db = postgres({...config, max:1, prepare:false, onnotice:()=>{}, connection:{application_name:'ecb10',options:`-c role=ecb10_${role}`},
    transform:{undefined:null}});
  const ready = db`select current_user`;
  return {db, ready};
}
