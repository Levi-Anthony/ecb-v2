import copy
import unittest
from probe import RAW, CANDIDATE, envelope, check, compatibility_view, extraction_request

class PreparationChecks(unittest.TestCase):
    def test_raw_is_preserved(self):
        raw = '  Jennifer wanted me to call her back.\n'
        self.assertEqual(envelope(raw)['raw'], raw)
    def test_empty_rejected(self):
        with self.assertRaises(ValueError): envelope('  ')
    def test_candidate_correspondence(self):
        self.assertEqual(check(envelope(RAW), CANDIDATE), [])
    def test_changed_source_rejected(self):
        env = envelope(RAW); env['raw'] += ' changed'
        self.assertIn('source_digest_mismatch', check(env, CANDIDATE))
    def test_invented_excerpt_rejected(self):
        c = copy.deepcopy(CANDIDATE); c['elements'][0]['excerpt'] = 'Mary'
        self.assertIn('excerpt_not_in_source', check(envelope(RAW), c))
    def test_uuid_promotion_field_rejected(self):
        c = copy.deepcopy(CANDIDATE); c['elements'][0]['canonical_uuid'] = 'fake'
        self.assertIn('invalid_element', check(envelope(RAW), c))
    def test_question_loss_rejected(self):
        c = copy.deepcopy(CANDIDATE); c['elements'][3]['question'] = ''
        self.assertIn('missing_interpretive_entry', check(envelope(RAW), c))
    def test_duplicate_local_handle_rejected(self):
        c = copy.deepcopy(CANDIDATE); c['elements'][1]['handle'] = 'jennifer'
        self.assertIn('invalid_or_duplicate_handle', check(envelope(RAW), c))
    def test_two_continuations_preserve_base(self):
        a = compatibility_view(envelope(RAW), CANDIDATE, 'already_discussed')
        b = compatibility_view(envelope(RAW), CANDIDATE, 'gift_information')
        self.assertEqual(a['base_evidence'], b['base_evidence'])
        self.assertEqual(a['annotation'], b['annotation'])
        self.assertEqual(a['parent'], b['parent'])
        self.assertNotEqual(a['additional_evidence'], b['additional_evidence'])
        self.assertEqual(a['canonical_promotions'] + b['canonical_promotions'], [])
    def test_extractor_does_not_see_continuations(self):
        request = extraction_request('openai/gpt-4o-mini')
        import json
        self.assertNotIn('birthday', json.dumps(request))
        self.assertNotIn('appointment', json.dumps(request))
    def test_semantic_limit_is_explicit(self):
        c = copy.deepcopy(CANDIDATE)
        c['elements'][0]['description'] = 'Jennifer is definitely Mary\'s sister'
        # Correspondence checker cannot reject this false inference: no semantic PASS is licensed.
        self.assertEqual(check(envelope(RAW), c), [])

if __name__ == '__main__': unittest.main()
