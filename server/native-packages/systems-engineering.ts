import type { NativePackageDescriptor } from './domain-admission.js';

export const systemsEngineeringNativePackages: NativePackageDescriptor[] = [
  {
    id: 'se:omg:sysml:2.0', domain: 'systems-engineering', name: 'OMG Systems Modeling Language (SysML) 2.0',
    authority_ref: 'https://www.omg.org/spec/SysML/2.0/About-SysML', edition_ref: 'SysML 2.0 / formal 26-03-02, adoption September 2025',
    semantic_scope: ['requirements', 'behavior', 'structure', 'analysis', 'verification', 'views', 'domain libraries'],
    identity_scheme: 'SysML/KerML element identity', access_routes: ['Systems Modeling API 1.0', 'native SysML repositories'],
    validation_routes: ['SysML 2.0 language/tool validation'], currentness_routes: ['OMG formal specification history'],
    source_refs: ['https://www.omg.org/spec/SysML/2.0/About-SysML'], status: 'ACTIVE',
  },
  {
    id: 'se:omg:systems-modeling-api:1.0', domain: 'systems-engineering', name: 'OMG Systems Modeling API and Services 1.0',
    authority_ref: 'https://www.omg.org/spec/SystemsModelingAPI/1.0', edition_ref: 'Systems Modeling API 1.0 / formal 26-03-04, adoption September 2025',
    semantic_scope: ['model access', 'project/commit/element addressing', 'relationships', 'machine-readable interchange'],
    identity_scheme: 'project / commit / element', access_routes: ['OpenAPI', 'JSON schema', 'OSLC shapes and vocabulary'],
    validation_routes: ['normative OpenAPI/JSON/OSLC artifacts'], currentness_routes: ['OMG formal specification history'],
    source_refs: ['https://www.omg.org/spec/SystemsModelingAPI/1.0'], status: 'ACTIVE',
  },
  {
    id: 'se:iso:42010:2022', domain: 'systems-engineering', name: 'ISO/IEC/IEEE 42010:2022 Architecture Description',
    authority_ref: 'https://www.iso.org/standard/74393.html', edition_ref: 'ISO/IEC/IEEE 42010:2022 edition 2',
    semantic_scope: ['entity of interest', 'architecture description', 'stakeholders', 'concerns', 'viewpoints', 'model kinds'],
    access_routes: ['ISO standard publication'], validation_routes: ['ISO/IEC/IEEE 42010 conformance requirements'],
    currentness_routes: ['ISO standard lifecycle'], source_refs: ['https://www.iso.org/standard/74393.html'], status: 'ACTIVE',
  },
  {
    id: 'se:nasa:hdbk-1009a:2025', domain: 'systems-engineering', name: 'NASA-HDBK-1009A Systems Modeling Handbook for Systems Engineering',
    authority_ref: 'https://standards.nasa.gov/standard/NASA/NASA-HDBK-1009', edition_ref: 'NASA-HDBK-1009A, 2025-03-12',
    semantic_scope: ['stakeholder expectations', 'ConOps', 'requirements', 'verification', 'validation', 'model planning', 'generated views'],
    access_routes: ['NASA Technical Standards System'], validation_routes: ['NASA handbook practices and companion model'],
    currentness_routes: ['NASA Standards Update Notification System', 'NASA standard lifecycle'],
    source_refs: ['https://standards.nasa.gov/standard/NASA/NASA-HDBK-1009'], status: 'ACTIVE',
  },
];
