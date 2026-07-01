# COGNITIVE_SKILLS_MAP.md

# Mind Ur Mind Learning Lab™

## Cognitive Skills Map — Educational Competency Framework v1.0

**Status:** Active
**Governed by:** `PROJECT_RULES.md`, `LEARNING_BIBLE.md`, `LEARNING_SCIENCE_FRAMEWORK.md`, `QUANTUM_SPEED_READING_CURRICULUM.md`

This is not neuroscience documentation and not marketing. It is an educational competency framework: the single, shared vocabulary of cognitive skills this platform trains, and the explicit map of which exercise develops which skill.

---

# Section 1 — Purpose

The documents that already exist describe philosophy (`LEARNING_BIBLE.md`, `LEARNING_SCIENCE_FRAMEWORK.md`) and sequence (`QUANTUM_SPEED_READING_CURRICULUM.md`). None of them answer a more basic question: *what is the fixed list of cognitive skills this platform trains, and which exercise trains which skill?* Without an explicit answer, every exercise specification would be free to name skills in its own words, AI adaptation logic would have no shared taxonomy to reason over, and a claim like "this Lab's training supports that Lab's training" would have nothing concrete underneath it.

This document is that shared vocabulary. It exists so that the word "attention" means the same thing in an exercise specification, in an AI Mentor's internal reasoning, and in a parent-facing explanation, every time it is used anywhere in this platform.

**How developers should use it.** As the canonical skill taxonomy. Any feature that reasons about what a student is developing — recommendation logic, future Mind Passport analytics, adaptive sequencing — should reference skill names exactly as defined in Section 2, and should never invent a new skill name in code or copy without it first being added here.

**How educators should use it.** As a plain-language account of what this platform actually trains, accurate enough to explain to a parent or a school without either overstating or understating what is really happening.

**How AI should use it.** As the structured vocabulary behind adaptive reasoning. When the AI Mentor or any future recommendation system decides what to suggest next, it reasons in terms of the named skills below and their relationships (Sections 4 and 7) — never in terms of a skill, or a claim about a skill, that does not appear in this document.

---

# Section 2 — Core Cognitive Skills

Twenty-one skills, defined carefully and distinguished from their closest neighbors where the boundary could otherwise be unclear.

| Skill | Definition |
|---|---|
| **Attention** | The general capacity to selectively process some information over other available information. The umbrella construct beneath the more specific attention skills below. |
| **Sustained Attention** | The capacity to maintain focus on a task or stimulus over an extended period without significant lapses. |
| **Selective Attention** | The capacity to focus on a relevant target while filtering out competing, irrelevant stimuli. |
| **Visual Attention** | The application of attention specifically within the visual domain — what gets visually noticed and processed. |
| **Eye Control** | The deliberate, voluntary command of eye movement, distinct from reflexive or automatic motion. |
| **Visual Tracking** | The specific capacity to smoothly follow a moving visual target with the eyes. |
| **Peripheral Awareness** | The capacity to notice and process visual information outside the direct point of fixation. |
| **Visual Span** | The amount of visual material — words, symbols, shapes — that can be meaningfully processed within a single fixation. |
| **Working Memory** | The capacity to hold and actively manipulate a small amount of information over a short period. |
| **Visual Memory** | The capacity to retain and recall visual information specifically, distinct from verbal or semantic memory. |
| **Processing Speed** | How quickly information can be perceived, interpreted, and acted on. |
| **Pattern Recognition** | The capacity to notice structure, regularity, or repetition in information. |
| **Reading Fluency** | The capacity to read text accurately, smoothly, and at a comfortable pace — distinct from comprehension; a learner can read fluently without fully comprehending, and comprehend slowly without fluency. |
| **Reading Comprehension** | The capacity to construct meaning from text. |
| **Mental Flexibility** | The capacity to shift between different ways of thinking about or approaching a task. |
| **Executive Function** | The set of higher-order control processes — planning, inhibition, task-switching — that coordinate other cognitive skills. |
| **Decision Making** | The capacity to evaluate options and select a course of action. |
| **Cognitive Endurance** | The capacity to sustain effortful cognitive work over time without significant decline in comfort or performance. |
| **Self Regulation** | The capacity to monitor and adjust one's own behavior, attention, or emotional state in service of a goal. |
| **Metacognition** | Awareness and understanding of one's own thought and learning processes. |
| **Transfer of Learning** | The degree to which a skill developed in one context is successfully applied in a different context. |

---

# Section 3 — Exercise-to-Skill Matrix

**Primary Skill** is the one capacity an exercise is built around (its Learning Objective, per the Curriculum and Exercise Spec Template). **Secondary Skills** are other capacities directly engaged by the exercise's own mechanic. **Transfer Skills** are capacities the exercise may plausibly support indirectly, outside its direct mechanic. **Confidence Level** reflects how directly observable the Primary Skill claim is from the exercise's mechanic, calibrated against the categories in Section 8 — it is not a score given to the learner, only a documentation-quality marker for curriculum designers.

| Exercise | Primary Skill | Secondary Skills | Transfer Skills | Confidence Level |
|---|---|---|---|---|
| Eye Warm-up™ | Eye Control | Visual Tracking, Sustained Attention | Reading Fluency, Cognitive Endurance | High |
| Eye Stretch™ | Eye Control | Visual Tracking, Peripheral Awareness | Visual Span, Reading Fluency | High |
| Eye Span™ | Visual Span | Visual Attention, Peripheral Awareness | Reading Fluency, Processing Speed | Moderate |
| Regression Control™ | Eye Control | Selective Attention, Self Regulation | Reading Fluency, Processing Speed | Moderate |
| Reading Speed™ | Reading Fluency | Eye Control, Sustained Attention | Cognitive Endurance, Reading Comprehension | High |
| RSVP™ | Processing Speed | Visual Attention, Working Memory | Reading Fluency, Cognitive Endurance | Moderate |
| Flash Reading™ | Processing Speed | Visual Attention, Pattern Recognition | Reading Fluency, Working Memory | Moderate |
| Peripheral Vision Reading™ | Peripheral Awareness | Visual Attention, Visual Span | Reading Fluency, Processing Speed | Exploratory |
| Chunk Reading™ | Visual Span | Pattern Recognition, Processing Speed | Reading Fluency, Reading Comprehension | Exploratory |
| Multi-Line Reading™ | Visual Span | Peripheral Awareness, Sustained Attention | Reading Fluency, Cognitive Endurance | Exploratory |
| Pattern Recognition™ | Pattern Recognition | Visual Attention, Processing Speed | Reading Comprehension, Decision Making | Exploratory |
| Dual Hemisphere Synchronization™ | Visual Attention | Peripheral Awareness, Mental Flexibility | Processing Speed, Cognitive Endurance | Exploratory |
| Visual Memory Reading™ | Visual Memory | Working Memory, Sustained Attention | Reading Comprehension, Pattern Recognition | Exploratory |
| Mental Imaging™ | Visual Memory | Mental Flexibility, Working Memory | Reading Comprehension, Metacognition | Exploratory |
| Concept Mapping™ | Executive Function | Pattern Recognition, Working Memory | Reading Comprehension, Decision Making | Exploratory |
| Intuition Activation™ | Pattern Recognition | Processing Speed, Self Regulation | Decision Making, Metacognition | Exploratory |
| Pattern Prediction™ | Pattern Recognition | Working Memory, Mental Flexibility | Reading Comprehension, Decision Making | Exploratory |
| Silent Observation™ | Sustained Attention | Self Regulation, Metacognition | Cognitive Endurance, Executive Function | Moderate |
| Whole Brain Integration™ | Transfer of Learning | Executive Function, Metacognition | Integrates all prior skills in this Lab | Exploratory |

The pattern across this table is deliberate, not an oversight: exercises already built and specified in detail (Eye Foundation Module™, Reading Flow Module™) carry High or Moderate confidence, because their mechanics are concrete and their skill claims are directly observable. Exercises not yet designed in detail (Reading Expansion Module™ onward) carry Exploratory confidence by default, and should be re-rated only once each one has its own completed Exercise Specification.

---

# Section 4 — Skill Development Path

Skills do not develop in isolation. The pathways below show how foundational skills compound into more complex ones — each terminating, where appropriate, in a compound real-world outcome rather than a manufactured additional "skill" not defined in Section 2.

**Visual-motor pathway:**
```
Visual Tracking → Eye Control → Visual Span → Reading Fluency
```
Visual Tracking is the rawest capacity — following a target at all. Eye Control is the deliberate version of that capacity. Visual Span depends on the eyes already moving comfortably and deliberately. Reading Fluency is what Visual Span looks like applied specifically to text. Together, these compound into more efficient, comfortable reading overall — itself an outcome, not a fifth skill on this list.

**Attention pathway:**
```
Visual Attention → Sustained Attention → Selective Attention → Cognitive Endurance
```
Visual Attention is attention applied to what is seen. Sustaining that attention over time, and selectively filtering what competes with it, are refinements of the same underlying capacity. Cognitive Endurance is what this pathway looks like extended across a full session, and ultimately supports broader study and learning stamina.

**Memory and comprehension pathway:**
```
Visual Memory → Working Memory → Pattern Recognition → Reading Comprehension
```
Visual Memory provides the raw material; Working Memory is what allows that material to be actively used rather than merely stored; Pattern Recognition organizes it; Reading Comprehension is what this pathway looks like applied to real text, producing genuine understanding rather than surface processing.

**Executive and decision pathway:**
```
Self Regulation → Metacognition → Executive Function → Decision Making
```
Self Regulation is the foundation — managing one's own attention and behavior. Metacognition is noticing that process happening. Executive Function coordinates it deliberately. Decision Making is that coordination applied to choosing between options, and ultimately supports independent, self-directed learning and sound judgment under time pressure.

**Transfer pathway (capstone):**
```
Reading Fluency + Reading Comprehension + Cognitive Endurance → Transfer of Learning
```
This is the point every other pathway is ultimately building toward: trained capability beginning to show up in real reading, real study, and daily life — the platform's actual goal, as stated in the Curriculum's Section 1, and the most conservatively claimed skill on this entire list (Section 8).

---

# Section 5 — Age Expectations

| Skill | Typical Development | Expected Improvement | Age Considerations |
|---|---|---|---|
| Attention | Develops through childhood into early adulthood | Gradual, at any age, with consistent practice | Shorter spans in younger children are developmental, not deficient |
| Sustained Attention | Lengthens through childhood and adolescence | Gradual extension of comfortable duration | Session length must respect age-typical limits, never push past them |
| Selective Attention | Improves through childhood as filtering matures | Better filtering of irrelevant stimuli over time | Young children are more easily pulled by distractors — expected, not a problem |
| Visual Attention | Present early; refines through childhood | More efficient allocation to relevant targets | Broadly consistent across this platform's age range |
| Eye Control | Basic control present early; precision refines into adolescence | Smoother, more deliberate movement at any age | No age floor — this is why Eye Foundation exercises support age 5+ |
| Visual Tracking | Present from early childhood; refines with practice | Smoother, less effortful following over time | Younger children benefit from larger, slower targets |
| Peripheral Awareness | Present from early childhood; deliberate use improves with practice | Gradually wider comfortable awareness | Consistent across ages; session duration should stay age-appropriate |
| Visual Span | Narrow in developing readers; widens with reading experience | Gradual widening with consistent practice | Meaningful only once basic literacy is established |
| Working Memory | Capacity increases through childhood into early adulthood | Modest, gradual gains | Never compare across ages; capacity differs by developmental stage |
| Visual Memory | Present early; continues refining through childhood | Gradual, with consistent practice | Similar trajectory to working memory generally |
| Processing Speed | Increases through childhood and adolescence; stabilizes in adulthood | Modest gains layered on natural developmental trajectory | Never compare improvement across ages — starting points differ fundamentally |
| Pattern Recognition | Present early; strengthens with experience and exposure | Meaningfully responsive to practice at any age | Younger learners benefit from concrete patterns; older learners can handle abstraction sooner |
| Reading Fluency | Develops through formal reading instruction, maturing through later childhood | Gradual, especially responsive once basic fluency exists | Requires a literacy floor; not applicable before it |
| Reading Comprehension | Develops alongside and after fluency, into adulthood | Gradual; strongly influenced by background knowledge and vocabulary outside this platform's scope | Requires fluency as a prerequisite |
| Mental Flexibility | Develops through childhood and adolescence alongside executive function | Gradual | Lower flexibility in younger children is developmental, not deficient |
| Executive Function | One of the latest-maturing cognitive systems, developing into early adulthood | Gradual; should never be expected to outpace typical developmental timelines | Exercises drawing primarily on this are better suited to older students |
| Decision Making | Matures alongside executive function, into early adulthood | Gradual, context-dependent | Better suited to older students, for the same reason as executive function |
| Cognitive Endurance | Increases through childhood and adolescence | Gradual, directly responsive to consistent practice | Session duration should always be capped to age-typical endurance |
| Self Regulation | Develops substantially through childhood into adolescence | Gradual; benefits strongly from a calm, low-pressure environment | Weaker regulation in younger children should never be treated as a problem here |
| Metacognition | Emerges later than most skills on this list, through later childhood and adolescence | Gradual; benefits from explicit invitations to reflect | Not meaningfully present in the youngest age band |
| Transfer of Learning | Not a developmental stage so much as an outcome dependent on depth and variety of practice | The least predictable improvement on this entire list | Applies across all ages; expectations should be the most conservative of any skill here |

---

# Section 6 — Assessment Indicators

No scores. Every skill is recognized through observable behavior over time.

| Skill | Observable Indicator |
|---|---|
| Attention | Fewer noticeable lapses during a task |
| Sustained Attention | Longer comfortable engagement before restlessness appears |
| Selective Attention | Less visible distraction by irrelevant on-screen elements |
| Visual Attention | Quicker, more direct engagement with the intended target at session start |
| Eye Control | More stable, less erratic movement; fewer early exits |
| Visual Tracking | Smoother following of a moving target, fewer momentary losses of it |
| Peripheral Awareness | Comfortable engagement with wider-spread visual content |
| Visual Span | Comfortable engagement with wider word-groupings or clusters at a glance |
| Working Memory | More comfortable handling of exercises requiring holding several recent elements in mind |
| Visual Memory | More comfortable engagement with recall-oriented visual exercises |
| Processing Speed | Comfortable engagement with briefer exposure durations |
| Pattern Recognition | Quicker, calmer engagement with structured or repeated material |
| Reading Fluency | Smoother, less effortful reading of real text at a steady pace |
| Reading Comprehension | Best observed outside the platform — through self-reported ease, or parent/teacher report |
| Mental Flexibility | More comfortable transitions between different exercise formats within a session |
| Executive Function | Less hesitation or disorganization when an exercise asks for a structured response |
| Decision Making | Quicker, calmer responses in exercises involving a choice between options |
| Cognitive Endurance | Longer sessions completed comfortably without fatigue-related early exit |
| Self Regulation | Fewer early exits overall; calmer recovery after a difficult exercise |
| Metacognition | Descriptive, self-aware language where reflection is invited — observed qualitatively, never scored |
| Transfer of Learning | Informal evidence, from a parent, a teacher, or the learner themselves, that a trained skill shows up outside the platform |

**How AI may infer improvement without displaying numerical scores.** The system may track trends in the indicators above internally — completion consistency, absence of early exits at a given level, sustained engagement duration — purely to decide what to offer a learner next. That internal tracking is never the same thing as displaying a number, a percentage, or a rank to the learner. The Mentor speaks about what it has noticed descriptively ("you've been completing this comfortably for two weeks now"), never numerically. Internal inference and external silence on numbers are both permanent, simultaneous requirements — one does not excuse the other.

---

# Section 7 — Cross-Lab Relationships

None of the Labs below are specified yet. What follows is the principle by which skills trained in Quantum Speed Reading Lab™ are expected to feed forward into them, not a guarantee of any future Lab's actual design.

- **Memory Intelligence Lab™** — builds directly on Working Memory and Visual Memory already engaged here. A learner arriving with comfortable Visual Span and Visual Memory has more material available to work with in memory-specific training.
- **Focus Intelligence Lab™** — builds directly on Sustained Attention, Selective Attention, and Cognitive Endurance already trained here.
- **Creative Intelligence Lab™** — would plausibly build on Mental Flexibility and Pattern Recognition.
- **Intuition Lab™** — builds on the trained, low-effort Pattern Recognition this Lab's later modules (Intuition Activation™, Pattern Prediction™) already begin developing.
- **Decision Intelligence Lab™** — builds on Executive Function and Decision Making already introduced in this Lab's later modules (Concept Mapping™, Pattern Prediction™).

---

# Section 8 — Scientific Integrity

Every skill below is classified honestly into one of three categories, following the standard set in `LEARNING_SCIENCE_FRAMEWORK.md` Section 14.

| Skill | Category | Note |
|---|---|---|
| Attention | Well-established educational construct | Foundational across cognitive psychology |
| Sustained Attention | Well-established educational construct | — |
| Selective Attention | Well-established educational construct | — |
| Visual Attention | Well-established educational construct | — |
| Eye Control | Well-established educational construct | The construct itself is well studied in vision science; its trainability for reading-specific benefit is more exploratory (see `eye-warm-up.md`, Section 5) |
| Visual Tracking | Well-established educational construct | Smooth-pursuit eye movement is a well-studied vision-science construct |
| Peripheral Awareness | Well-established educational construct | Same caveat as Eye Control: the construct is established; its trainability for reading benefit is more exploratory |
| Visual Span | Well-established educational construct | "Perceptual span" in reading is a genuinely well-studied area of reading science |
| Working Memory | Well-established educational construct | One of the most thoroughly studied constructs in cognitive psychology |
| Visual Memory | Well-established educational construct | Exact theoretical boundaries with working memory vary by model |
| Processing Speed | Well-established educational construct | Core construct in cognitive psychology and intelligence research |
| Pattern Recognition | Well-established educational construct | Extensively studied in cognitive psychology and perception research |
| Reading Fluency | Well-established educational construct | Core, extensively studied construct in reading science |
| Reading Comprehension | Well-established educational construct | Extensively studied in reading science |
| Mental Flexibility | Well-established educational construct | Sometimes treated as a sub-component of executive function rather than fully independent |
| Executive Function | Well-established educational construct | An umbrella construct; ongoing scholarly debate about its exact sub-components |
| Decision Making | Well-established educational construct | Extensively studied generally; this platform's exercises apply it in a narrow, simplified form |
| Cognitive Endurance | Widely accepted instructional construct | Commonly discussed in educational and occupational contexts; less unified as a single measurable construct than attention or working memory |
| Self Regulation | Well-established educational construct | Extensively studied in developmental and educational psychology |
| Metacognition | Well-established educational construct | Extensively studied since foundational work in the 1970s; broadly accepted |
| Transfer of Learning | Well-established educational construct | What is well established is specifically that transfer is real but typically narrower than expected — that nuance is itself the finding |

No claim in this document should be read as stronger than its category indicates, and no skill above should be re-classified upward without a credible, cited source — consistent with the permanent rule in `LEARNING_SCIENCE_FRAMEWORK.md` Section 14.

---

# Section 9 — Future Expansion

New skills may be added to this map without redesigning it. Adding one requires:

1. A careful, non-overlapping definition added to Section 2, distinguished from its closest existing neighbors.
2. An honest classification into Section 8's three-category scale.
3. A development pathway in Section 4, if it genuinely connects to existing skills.
4. Mapping to whichever exercises genuinely engage it in Section 3 — never retrofitted onto an exercise that doesn't actually use it.

The document's structure does not change. Only its content grows, and only when a new skill earns its place by the same standard every skill already here was held to.

---

# Section 10 — Permanent Constitution

The purpose of this Cognitive Skills Map is not to label learners.

Its purpose is to guide curriculum design, AI adaptation, educational review, and future expansion.

Every future exercise should identify the primary cognitive skill it develops and explain its educational value.
