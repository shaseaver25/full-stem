# Poll/Survey Component - TailorEDU LMS
## Comprehensive Feature Report

**Component Type:** `poll`  
**Icon:** 📊 BarChart3  
**Color Theme:** Soft Mint (#D1FAE5 / #065F46)  
**Phase:** Phase 2 - High Priority (Quick Win, High Engagement)  
**Status:** ✅ **COMPLETE**

---

## 🎯 OVERVIEW

The Poll/Survey component is a lightweight, real-time engagement tool designed for quick classroom participation and formative assessment. It enables teachers to gather instant feedback from students while displaying live results to encourage participation and discussion.

### Key Benefits
- **Real-time Engagement**: Students see live results as votes come in
- **Multiple Question Types**: Single choice, multiple choice, rating scales, and ranking
- **Anonymous Options**: Supports anonymous voting to encourage honest responses
- **Instant Analytics**: Teachers see participation rates and non-voters in real-time
- **Projector Mode**: Full-screen display for whole-class viewing
- **Accessibility**: Fully keyboard navigable with screen reader support

---

## 📊 DATABASE SCHEMA

### Tables Created

#### 1. **poll_components**
Core poll configuration table.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `component_id` | UUID | Links to lesson_components |
| `poll_question` | TEXT | The poll question text |
| `poll_type` | TEXT | Type: single_choice, multiple_choice, rating_scale, ranking |
| `show_results_timing` | TEXT | When to show results: before_voting, after_voting, never |
| `allow_anonymous` | BOOLEAN | Allow anonymous responses |
| `allow_change_vote` | BOOLEAN | Allow users to change their vote |
| `require_participation` | BOOLEAN | Mark as required/assignable |
| `close_poll_at` | TIMESTAMPTZ | Auto-close timestamp (optional) |
| `is_closed` | BOOLEAN | Manual close status |
| `chart_type` | TEXT | Display type: bar, pie, donut |
| `show_percentages` | BOOLEAN | Display percentage values |
| `show_vote_counts` | BOOLEAN | Display vote counts |

#### 2. **poll_options**
Individual answer options for each poll.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `poll_component_id` | UUID | Parent poll reference |
| `option_text` | TEXT | The option text (max 200 chars) |
| `option_order` | INTEGER | Display order |
| `vote_count` | INTEGER | Cached vote count |

#### 3. **poll_responses**
Student responses to polls.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `poll_component_id` | UUID | Parent poll reference |
| `user_id` | UUID | Student user (nullable for anonymous) |
| `selected_option_ids` | UUID[] | Selected options (single/multiple choice) |
| `rating_value` | INTEGER | Rating value (1-5 for rating scale) |
| `ranking_order` | JSONB | Ranking order (for ranking polls) |
| `is_anonymous` | BOOLEAN | Whether response is anonymous |
| `responded_at` | TIMESTAMPTZ | Response timestamp |

**Unique Constraint**: `(poll_component_id, user_id)` for non-anonymous responses

---

## 🎨 POLL TYPES

### 1. Single Choice
- **UI**: Radio buttons
- **Selection**: One option only
- **Options**: 2-10 options
- **Display**: Bar, pie, or donut chart
- **Use Cases**: "Which topic next?", "True/False", "A/B/C/D"

### 2. Multiple Choice
- **UI**: Checkboxes
- **Selection**: Multiple options allowed
- **Options**: 2-10 options
- **Display**: Bar chart (recommended)
- **Use Cases**: "Select all that apply", "Which features do you want?"

### 3. Rating Scale
- **UI**: 5-star rating or 1-10 scale
- **Selection**: Single rating value
- **Options**: Not applicable (uses predefined scale)
- **Display**: Average + distribution histogram
- **Use Cases**: "Rate your understanding", "How difficult was this?"

### 4. Ranking
- **UI**: Drag-and-drop list
- **Selection**: Order all options by preference
- **Options**: 2-10 options
- **Display**: Weighted average ranking table
- **Use Cases**: "Rank topics by interest", "Prioritize features"

---

## 👨‍🏫 TEACHER FEATURES

### Poll Builder Interface (`PollBuilderComponent`)

**Location**: Teacher lesson builder  
**Access**: Via "Add Component" → "Poll/Survey"

#### Features:
1. **Question Input**
   - Text input for poll question
   - Character limit: 500
   - Example prompts provided

2. **Poll Type Selection**
   - Dropdown with 4 poll types
   - Dynamic UI based on selection
   - Validation per type

3. **Answer Options**
   - Add/remove options (2-10)
   - Drag-and-drop reordering
   - 200 character limit per option
   - Real-time validation

4. **Poll Settings**
   - **Show Results**: Before/After/Never
   - **Anonymous Responses**: Toggle
   - **Allow Vote Changes**: Toggle
   - **Require Participation**: Toggle (marks as assignable)
   - **Auto-close**: Date/time picker (optional)

5. **Display Options**
   - **Chart Type**: Bar/Pie/Donut
   - **Show Percentages**: Toggle
   - **Show Vote Counts**: Toggle

6. **Actions**
   - Preview Poll
   - Save Poll

### Teacher Live View (`PollTeacherLiveView`)

**Location**: During lesson or class dashboard  
**Access**: Teacher view of poll component

#### Features:
1. **Real-time Participation Tracking**
   - Total responses / Total students
   - Participation percentage
   - Visual indicator (Green ✅ ≥70%, Yellow ⚠️ <70%)

2. **Non-voter List**
   - Shows students who haven't voted
   - Updates in real-time
   - Displays up to 7 names + count

3. **Live Results Display**
   - Auto-updating bar charts
   - Shows vote counts and percentages
   - Red pulse indicator for "LIVE"

4. **Poll Controls**
   - **Close Poll**: Prevents new votes
   - **Reopen Poll**: Allows voting again
   - **Reset Votes**: Clears all responses (with confirmation)
   - **Export Results**: Download CSV

5. **Results Management**
   - **Copy to Clipboard**: Plain text format
   - **Projector Mode**: Full-screen display

6. **Status Indicators**
   - Anonymous responses status
   - Vote changes allowed status
   - Poll open/closed status

### Projector Mode

**Activation**: "Display on Projector" button  
**Display**: Full-screen modal

#### Features:
- Large, clear question text
- Large bar charts with vote counts
- Participation summary
- Real-time updates (no refresh needed)
- Press ESC to exit
- Optimized for classroom projection

---

## 👨‍🎓 STUDENT FEATURES

### Poll Student View (`PollStudentView`)

**Location**: Within lesson flow  
**Access**: Students see poll when they reach it in lesson

#### Voting Interface

**Before Voting**:
- Clean, minimal interface
- Poll question prominently displayed
- Appropriate input UI based on poll type:
  - Radio buttons (single choice)
  - Checkboxes (multiple choice)
  - Star rating (rating scale)
  - Drag-and-drop list (ranking)
- Participation count shown
- Anonymous indicator (if enabled)
- Submit Vote button

**Single Choice Example**:
```
What topic should we explore next?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
○ Photosynthesis
○ Cell Division
○ DNA Structure
○ Genetics

👥 12 students have voted
                    [Submit Vote]
ℹ️  Your response is anonymous
```

**Rating Scale Example**:
```
How well did you understand today's material?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ⭐⭐⭐⭐⭐
  Click a rating to submit
```

**Ranking Example**:
```
Drag to order topics from most to least interesting:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
≡ 1. Cell Division        [Drag]
≡ 2. Photosynthesis       [Drag]
≡ 3. Genetics             [Drag]
≡ 4. DNA Structure        [Drag]
                [Submit Ranking]
```

#### Results Display

**After Voting** (if `show_results_timing = 'after_voting'`):
- Confirmation of vote submission
- Your vote highlighted in green box
- Bar charts showing all results
- Vote counts and percentages (if enabled)
- Total participation count
- Change Vote button (if allowed)

**Live Results Example**:
```
✓ Your Vote: Photosynthesis

Photosynthesis  ████████████████████ 50% (6 votes)
Cell Division   ████████░░░░░░░░░░░░ 25% (3 votes)
DNA Structure   ████░░░░░░░░░░░░░░░░ 17% (2 votes)
Genetics        ████░░░░░░░░░░░░░░░░ 8%  (1 vote)

👥 12 of 25 students voted (48%)
```

#### Student Capabilities
- ✅ Vote once (or change if allowed)
- ✅ See results based on settings
- ✅ Anonymous voting (if enabled)
- ✅ Drag-and-drop ranking
- ✅ Star rating with visual feedback
- ✅ Real-time result updates
- ✅ Mobile-responsive interface

---

## ⚡ REAL-TIME FEATURES

### Supabase Realtime Integration

**Tables with Realtime Enabled**:
- `poll_responses`
- `poll_options`

#### Student View Real-time Updates:
```typescript
supabase
  .channel('poll-updates')
  .on('postgres_changes', { 
    event: '*', 
    schema: 'public', 
    table: 'poll_responses' 
  }, () => {
    loadPollData(); // Refresh results
  })
  .subscribe();
```

#### Teacher View Real-time Updates:
```typescript
supabase
  .channel('teacher-poll-updates')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'poll_responses'
  }, () => {
    loadPollData(); // Update participation and results
  })
  .subscribe();
```

### What Updates in Real-time:
- ✅ Vote counts on all views
- ✅ Participation percentages
- ✅ Non-voter list (teacher view)
- ✅ Bar chart animations (smooth growth)
- ✅ Total response counts
- ✅ Projector mode display
- ✅ No page refresh required

### Performance:
- Subscriptions auto-cleanup on unmount
- Debounced updates (prevents spam)
- Efficient queries (count-only where possible)
- Cached results with invalidation

---

## 🔐 SECURITY & RLS POLICIES

### Row-Level Security Enabled on All Tables

#### poll_components Policies:
- **Teachers**: Full CRUD on polls in their lessons
- **Students**: SELECT only for polls in enrolled classes
- **Admins**: Full access (via role checks)

#### poll_options Policies:
- **Teachers**: Full CRUD on options for their polls
- **Students**: SELECT only for polls in enrolled classes

#### poll_responses Policies:
- **Students**: INSERT their own, UPDATE their own (if changes allowed), SELECT their own
- **Teachers**: SELECT all responses for their polls (including anonymous)
- **Anonymous**: INSERT allowed when `allow_anonymous = true` and `user_id IS NULL`

### Data Privacy:
- Anonymous responses have `user_id = NULL`
- Teachers can see response data but not link to specific students
- Non-anonymous responses are tied to `user_id`
- Unique constraint prevents duplicate votes from same user

---

## 📱 ACCESSIBILITY & UX

### WCAG 2.1 AA Compliance:
- ✅ Keyboard navigation (all interactive elements)
- ✅ Focus indicators (visible focus rings)
- ✅ Screen reader labels (ARIA labels)
- ✅ Color contrast (4.5:1 minimum)
- ✅ Touch targets (44x44px minimum)
- ✅ Responsive design (mobile-first)

### Keyboard Shortcuts:
- **Tab/Shift+Tab**: Navigate options
- **Space/Enter**: Select option
- **Arrow Keys**: Navigate radio buttons
- **ESC**: Close projector mode

### Mobile Optimizations:
- Touch-friendly drag-and-drop (ranking)
- Large tap targets for stars (rating)
- Responsive charts (bar widths adjust)
- Scrollable option lists

### User Feedback:
- Toast notifications for all actions
- Loading states during submission
- Success confirmations
- Error messages with guidance

---

## 📈 ANALYTICS & INSIGHTS

### Teacher Analytics Dashboard (Coming Soon)

**Metrics Available**:
1. **Participation Rates**
   - Total responses / Total students
   - Participation over time
   - Non-voter tracking

2. **Response Distribution**
   - Vote counts per option
   - Percentage breakdowns
   - Consensus indicators

3. **Engagement Metrics**
   - Time to first vote
   - Vote change frequency
   - Peak voting times

4. **Comparison Tools**
   - Class-to-class comparison
   - Historical poll results
   - Trend analysis

### Export Options:
- **CSV**: Vote counts and percentages
- **Clipboard**: Plain text summary
- **Screenshot**: Visual chart capture (future)

---

## 🎓 PEDAGOGICAL USE CASES

### Formative Assessment
- ✅ Check for understanding
- ✅ Identify misconceptions
- ✅ Gauge prior knowledge
- ✅ Exit tickets

### Engagement & Participation
- ✅ Warm-up questions
- ✅ Topic selection (student voice)
- ✅ Icebreakers
- ✅ "Would you rather?" games

### Discussion Starters
- ✅ Poll first, discuss results
- ✅ Opinion polls (agree/disagree)
- ✅ Controversial topics (anonymous)
- ✅ Class decision-making

### Feedback Collection
- ✅ Rate lesson difficulty
- ✅ Pacing feedback
- ✅ Interest surveys
- ✅ Self-assessment

### Examples by Subject:

**Math**:
- "Which strategy makes the most sense?"
- "Rate your confidence with today's concept"
- "Rank these problems by difficulty"

**Science**:
- "What do you predict will happen?"
- "Which variable should we test first?"
- "Rate your understanding of photosynthesis"

**English**:
- "Which theme is most important in this text?"
- "Rank these essay topics by interest"
- "Vote for our next class novel"

**History**:
- "Who had the most impact on this event?"
- "Rank these causes by importance"
- "What would you have done in this situation?"

---

## 🚀 PERFORMANCE OPTIMIZATION

### Database Optimizations:
- Indexed foreign keys
- Indexed user lookups
- Count-only queries where possible
- Batch operations for option CRUD

### Frontend Optimizations:
- Lazy loading poll options
- Debounced real-time updates
- Cached vote counts
- Conditional rendering based on poll state

### Real-time Optimizations:
- Single subscription per view
- Cleanup on component unmount
- Efficient row-level filtering
- Minimal payload transfers

---

## ✅ TESTING CHECKLIST

### Teacher Workflow:
- [x] Create poll with all 4 types
- [x] Add/remove/reorder options
- [x] Configure poll settings
- [x] Save and edit existing polls
- [x] View live results
- [x] Close/reopen polls
- [x] Reset votes
- [x] Export results
- [x] Projector mode

### Student Workflow:
- [x] View poll in lesson
- [x] Vote (all 4 types)
- [x] See results (after voting)
- [x] Change vote (if allowed)
- [x] Anonymous voting
- [x] Real-time updates

### Edge Cases:
- [x] No votes yet (empty state)
- [x] Tie votes (equal percentages)
- [x] Closed poll (no voting)
- [x] Maximum options (10)
- [x] Minimum options (2)
- [x] Long option text (200 chars)
- [x] Mobile responsiveness

---

## 🔮 FUTURE ENHANCEMENTS

### Phase 3 Additions:
1. **Advanced Poll Types**
   - Word cloud polls
   - Open-ended text responses
   - Image-based options
   - Emoji reactions

2. **Analytics Dashboard**
   - Historical poll comparison
   - Student participation trends
   - Response time analytics
   - Export to LMS gradebook

3. **AI-Powered Features**
   - Auto-generate poll questions from content
   - Suggest optimal poll types
   - Analyze response patterns
   - Generate discussion prompts from results

4. **Enhanced Visualization**
   - Animated charts
   - Real-time leaderboards
   - Gamification elements
   - Custom themes

5. **Integration Features**
   - Link polls to quiz questions
   - Export to discussion threads
   - Sync with calendar events
   - Share across classes

---

## 📝 KNOWN LIMITATIONS

### Current Constraints:
- Maximum 10 options per poll
- No image/media in options
- No branching logic (conditional questions)
- No poll templates library
- No scheduled auto-open (only auto-close)
- Rating scale limited to 1-5 (no custom ranges)

### Workarounds:
- For >10 options: Create multiple polls
- For images: Use description text with links
- For branching: Create separate polls

---

## 🎉 CONCLUSION

The Poll/Survey component is a **fully functional, production-ready** tool for classroom engagement and formative assessment. It combines:

✅ **Ease of Use**: Simple builder interface  
✅ **Real-time Engagement**: Live results and updates  
✅ **Flexibility**: 4 poll types for different scenarios  
✅ **Accessibility**: WCAG compliant, mobile-responsive  
✅ **Teacher Control**: Comprehensive settings and analytics  
✅ **Student Privacy**: Anonymous voting support  
✅ **Scalability**: Handles large classes efficiently  

### Quick Start:
1. Teacher: Add "Poll/Survey" component in lesson builder
2. Configure question, type, and options
3. Set display and privacy settings
4. Save poll
5. Students vote during lesson
6. View live results in teacher dashboard
7. Export or discuss results with class

**Ready for immediate deployment in TailorEDU LMS!** 🚀
