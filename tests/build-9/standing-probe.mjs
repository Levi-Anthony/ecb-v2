import * as s from './support.mjs';
try{
 const f=await s.make();await s.run(f);
 const link=(await s.admin`insert into public.evidence_links(claim_id,evidence_referent_id) values(${f.decision}::uuid,'19a949ea-a8fc-4250-a386-fa64e5530180') returning id`)[0].id;
 const transition=(await s.admin`insert into public.claim_standing_transitions(claim_id,from_standing,to_standing,basis_evidence_link_id) values(${f.decision}::uuid,'unassessed','basis_qualified',${link}::uuid) returning id`)[0].id;
 const card=await s.inspect(f);s.save('standing-defect-01.json',{implementation:'b7682bf plus formatting only',focal:f.p,transition,card,classification:'M',finding:'Existing Claim standing writer was omitted from declared reentry observation/lock closure; CONTINUE after source standing drift is invalid.'});console.log(card.present);
}finally{await s.close();}
