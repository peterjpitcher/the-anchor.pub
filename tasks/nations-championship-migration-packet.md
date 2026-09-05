# Exact Cheers production migration packet

Status: not applied. Local SQL validation completed. This packet records the exact proposed SQL; it is not permission to execute it.

## Verified target

Project: `cheersai2.0`, reference `nbkjciurhvkfpcpatbnt`. The repository environment URL host and connected Supabase project listing agreed. Management is a separate project, `tfcasgxopxegwrabvwat`, and receives no schema migration for this work.

Read-only preflight found one tournament and 104 existing fixtures. Existing account-membership RLS remains in place. No dependent views or materialized views were found on the changed fixture objects. Existing updated-at triggers were inspected. Latest migration history recorded during preflight: `20260905054726`. Recheck identity, migration history and schema immediately before any approved application because another session may have changed production.

## Changes and risk

Migration 1 adds rugby/screening fields, widens the round constraint without removing football values, and adds a unique tournament/import-key index. Existing tournaments default to football; new screening decisions default to unconfirmed. Existing fixture values are preserved.

Migration 2 adds an invoker-security trigger. It serialises rugby confirmations within an account, rejects overlapping screen/commentary allocations, requires essential confirmation fields and makes content revisions monotonic. The trigger routine cannot be called directly by PUBLIC, anon or authenticated roles. It creates no new data-reading surface or policy.

High-risk statements to approve explicitly:

- ALTER TABLE and CHECK/NOT NULL defaults on populated tables.
- Replacement of the existing round CHECK constraint with a wider list.
- Unique index creation on populated fixtures.
- A new trigger/function that changes revision metadata and can reject conflicting writes.
- Explicit function privilege revocation.

ALTER TABLE requires a strong table lock. Constraint validation and regular index creation can briefly block writers. Both transactions use a five-second lock timeout and should fail rather than wait indefinitely for a lock. Preflight tables were small, but no production execution-time guarantee is made. The advisory lock serialises rugby edits per account. No hours table, customer, booking, payment or message row is changed by this SQL.

## Local validation

Both exact files were applied to isolated PostgreSQL 17 with representative old football and new rugby rows. Old football values remained valid; new round values and nullable unknown screening data were accepted; invalid time bounds and duplicate import keys were rejected. Conflicting confirmed screenings were rejected.

The corrected trigger was exercised with direct writes: revision rollback from 2 to 1 retained 2; changing a team while supplying revision 200 produced 3. The test transaction was rolled back and the isolated server stopped. No live data was used as a mutation test.

The full Supabase auth/RLS environment was not recreated in that local PostgreSQL harness. Existing production policy definitions were inspected read-only; application account-scoping and both feed versions were tested with scoped doubles. A representative authenticated-role/anon exposure check is required after approved application. This named validation limit is part of the release approval.

## Exact application order and SQL

Apply these exact files in order through the verified Supabase MCP migration tool. Do not use production CLI db push. Recompute both checksums first and stop if either differs. Capture the apply-time version mapping returned by Supabase.

### 20260905071016_nations_championship_screenings.sql

Migration name: `nations_championship_screenings`

SHA-256: `880f7786aa5080d420ae4ee9c0cea9bc3286ce5100bdccc2d631cdca0fbe53d1`

```sql
-- Additive rugby screening facts. Existing football rows retain their behaviour.
-- Production application requires approval of this exact file and checksum.
BEGIN;
SET LOCAL lock_timeout = '5s';
ALTER TABLE public.tournaments
  ADD COLUMN sport text NOT NULL DEFAULT 'football' CHECK (sport IN ('football', 'rugby_union'));
ALTER TABLE public.tournament_fixtures
  ADD COLUMN import_key text CHECK (import_key IS NULL OR (length(import_key) BETWEEN 1 AND 100 AND import_key ~ '^[a-zA-Z0-9_-]+$')),
  ADD COLUMN round_number integer CHECK (round_number BETWEEN 1 AND 6),
  ADD COLUMN final_position integer CHECK (final_position BETWEEN 1 AND 6),
  ADD COLUMN planned_end_at timestamptz CHECK (planned_end_at > kick_off_at),
  ADD COLUMN match_state text NOT NULL DEFAULT 'scheduled' CHECK (match_state IN ('scheduled', 'in_progress', 'finished', 'cancelled')),
  ADD COLUMN screening_decision text NOT NULL DEFAULT 'unconfirmed' CHECK (screening_decision IN ('unconfirmed', 'confirmed', 'not_showing')),
  ADD COLUMN broadcast_decision text NOT NULL DEFAULT 'unconfirmed' CHECK (broadcast_decision IN ('unconfirmed', 'confirmed', 'not_linear')),
  ADD COLUMN linear_channel text CHECK (length(linear_channel) BETWEEN 1 AND 100),
  ADD COLUMN screen_label text CHECK (length(screen_label) BETWEEN 1 AND 100),
  ADD COLUMN commentary text NOT NULL DEFAULT 'unconfirmed' CHECK (commentary IN ('unconfirmed', 'on', 'off')),
  ADD COLUMN source_url text CHECK (source_url IS NULL OR source_url LIKE 'https://%'),
  ADD COLUMN source_checked_at timestamptz,
  ADD COLUMN broadcast_checked_at timestamptz,
  ADD COLUMN screening_confirmed_at timestamptz,
  ADD COLUMN content_revision integer NOT NULL DEFAULT 1 CHECK (content_revision > 0);
-- Widen the existing text check without removing any football round.
ALTER TABLE public.tournament_fixtures DROP CONSTRAINT tournament_fixtures_round_check;
ALTER TABLE public.tournament_fixtures ADD CONSTRAINT tournament_fixtures_round_check
  CHECK (round IN ('group_stage', 'round_of_32', 'round_of_16', 'quarter_final', 'semi_final', 'third_place', 'final', 'league_round', 'placement_final'));
CREATE UNIQUE INDEX tournament_fixtures_import_key_unique
  ON public.tournament_fixtures (tournament_id, import_key) WHERE import_key IS NOT NULL;
-- No new exposed relations/routines, grants or RLS changes.
COMMIT;
```

### 20260905072213_tournament_screening_revision_guard.sql

Migration name: `tournament_screening_revision_guard`

SHA-256: `0be080e2533f7513914d8f66b95c58337b8b4902368fba14020c0e46d00a9f6a`

```sql
-- Serialise rugby confirmations for each account and make freshness revision automatic.
BEGIN;
SET LOCAL lock_timeout = '5s';
CREATE FUNCTION public.guard_tournament_screening_revision()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
DECLARE
  fixture_account uuid;
  fixture_sport text;
BEGIN
  SELECT account_id, sport INTO fixture_account, fixture_sport
  FROM public.tournaments WHERE id = NEW.tournament_id;
  IF fixture_sport IS DISTINCT FROM 'rugby_union' THEN RETURN NEW; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(fixture_account::text, 731));
  IF TG_OP = 'INSERT' THEN
    NEW.content_revision := 1;
  ELSIF
    (to_jsonb(NEW) - ARRAY['updated_at','content_revision','content_generated']) IS DISTINCT FROM
    (to_jsonb(OLD) - ARRAY['updated_at','content_revision','content_generated']) THEN
    NEW.content_revision := OLD.content_revision + 1;
    NEW.content_generated := false;
  ELSE
    NEW.content_revision := OLD.content_revision;
  END IF;
  IF NEW.screening_decision = 'confirmed' AND NEW.match_state IN ('scheduled', 'in_progress') THEN
    IF NEW.broadcast_decision <> 'confirmed' OR NEW.broadcast_checked_at IS NULL
      OR NEW.screening_confirmed_at IS NULL OR nullif(btrim(NEW.linear_channel), '') IS NULL
      OR nullif(btrim(NEW.screen_label), '') IS NULL OR NEW.planned_end_at IS NULL THEN
      RAISE EXCEPTION 'Confirmed screening requires verified channel, screen and planned end';
    END IF;
    IF EXISTS (
      SELECT 1 FROM public.tournament_fixtures f JOIN public.tournaments t ON t.id = f.tournament_id
      WHERE t.account_id = fixture_account AND t.sport = 'rugby_union'
        AND f.id <> NEW.id AND f.screening_decision = 'confirmed'
        AND f.match_state IN ('scheduled', 'in_progress')
        AND f.kick_off_at < NEW.planned_end_at AND f.planned_end_at > NEW.kick_off_at
        AND (lower(btrim(f.screen_label)) = lower(btrim(NEW.screen_label))
          OR (f.commentary = 'on' AND NEW.commentary = 'on'))
    ) THEN
      RAISE EXCEPTION 'Overlapping confirmed screening uses this screen or commentary';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.guard_tournament_screening_revision() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER tournament_screening_revision_guard
BEFORE INSERT OR UPDATE ON public.tournament_fixtures
FOR EACH ROW EXECUTE FUNCTION public.guard_tournament_screening_revision();
COMMIT;
```

## Rollback and containment

There is no automatic destructive down migration. Keep the added columns and rugby records. Rolling back to the narrower football-only round constraint would reject valid new data and is not part of this release.

If application rollback is needed, pause new rugby generation and its queued jobs first, retain the new delivery guard or disable those rugby jobs entirely, and put the website feed into its honest unavailable state. Restore the earlier application only after ensuring an older publisher cannot process rugby jobs. Do not delete published posts automatically.

If the trigger itself causes an operational issue, retain it until an exact forward fix has been reviewed. An emergency trigger-disable or DROP requires separate explicit authorisation because it removes the concurrency/revision guard. No hours change is a rollback step.

## Post-apply checks

1. Verify the target project, migration mapping and both checksums.
2. Re-read columns, defaults, constraints, unique index, function definition, search path, trigger and grants.
3. Confirm RLS definitions did not change and no new anon data/routine exposure exists. Test intended account-member and service-role paths with a designated isolated test identity.
4. Repeat old football read/feed checks and new fixture validation with approved dedicated test records, inside a guaranteed rollback transaction where possible. Do not use real business rows as mutating tests.
5. Verify new/changed revision and overlap rejection, then strict hours, current feed and website booking-availability GET paths.
6. Record deployment IDs and inspect database/application logs. Do not call a production booking or social send verified unless that separately approved mutation has been exercised.
