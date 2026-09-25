"""Freeze a distinct, uninspected exact-prompt set before package implementation."""
import json
import secrets
from pathlib import Path

subjects = [
    "a library catalog revision", "a transit timetable change", "a lab sample relabeling",
    "a museum loan return", "an archival custody handoff", "a recipe substitution",
    "a volunteer rota", "a classroom seating change", "a garden irrigation plan",
    "a maintenance inspection", "a warehouse packing rule", "a music score edition",
    "a field survey map", "a public meeting transcript", "a workshop tool checkout",
    "a donation receipt", "a patient appointment schedule", "a hiking route diversion",
]
templates = [
    ("AUDIT", "Check the current evidence and standing of {s}; identify the source and whether the old approval still applies."),
    ("AUDIT", "Did the record for {s} actually authorize this use? Separate evidence from permission."),
    ("SCOUT", "The baseline for {s} is established. Explore useful structural connections beyond it and give a testable lead."),
    ("SCOUT", "With the accepted facts about {s} fixed, search for plausible prior-art mechanisms. Return none if none has leverage."),
    ("FULCRUM", "A proposed analogy about {s} could change our choice. Find the hinge, two outcomes, and a discriminating test."),
    ("FULCRUM", "For {s}, what single question separates a preserved record from newly required coverage, and why do its branches matter?"),
    ("TRANSLATION", "Test the exact claim that a change of index for {s} transports every relevant obligation. Derive a consequence and a counterexample."),
    ("TRANSLATION", "Formalize whether the source slot mapping for {s} preserves composition without granting current reliance."),
    ("NOTATION", "For the existing expression g: X → Y used in {s}, tell me its name, pronunciation, meaning, and a tiny example only."),
    ("NOTATION", "Read A ⊆ B aloud and explain it with a toy {s} example; leave the argument untouched."),
    ("NEXT", "The change log for {s} is approved and ready. Apply the authorized update and report completion."),
    ("NEXT", "Which already authorized action follows the finished {s} review? Keep this to the next action."),
    ("MIXED", "For {s}, audit the old approval first; if the evidence floor survives, explore one analogy, labeling it speculative."),
    ("MIXED", "Explain the notation in the existing {s} formula, then test a separate exact transport claim; keep the two outputs separate."),
]

seed = secrets.randbits(64)
random = __import__("random").Random(seed)
picked = random.sample(subjects, len(templates))
records = [dict(id=f"H{i:02}", intent=kind, prompt=pattern.format(s=subject))
           for i, ((kind, pattern), subject) in enumerate(zip(templates, picked), 1)]
Path(__file__).with_name("holdout.json").write_text(json.dumps(records, indent=2) + "\n")
Path(__file__).with_name("holdout_seed.txt").write_text(f"{seed}\n")
