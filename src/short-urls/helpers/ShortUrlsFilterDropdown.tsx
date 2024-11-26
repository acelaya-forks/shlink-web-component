import { DropdownBtn } from '@shlinkio/shlink-frontend-kit';
import { DropdownItem } from 'reactstrap';
import { useFeature } from '../../utils/features';
import type { ShortUrlsFilter } from '../data';

interface ShortUrlsFilterDropdownProps {
  onChange: (filters: ShortUrlsFilter) => void;
  selected?: ShortUrlsFilter;
  className?: string;
}

export const ShortUrlsFilterDropdown = (
  { onChange, selected = {}, className }: ShortUrlsFilterDropdownProps,
) => {
  const supportsDisabledFiltering = useFeature('filterDisabledUrls');
  const { excludeBots = false, excludeMaxVisitsReached = false, excludePastValidUntil = false } = selected;
  const onFilterClick = (key: keyof ShortUrlsFilter) => () => onChange({ ...selected, [key]: !selected?.[key] });

  return (
    <DropdownBtn text="Filters" dropdownClassName={className} end minWidth={250}>
      <DropdownItem header aria-hidden>Visits:</DropdownItem>
      <DropdownItem active={excludeBots} onClick={onFilterClick('excludeBots')}>Ignore visits from bots</DropdownItem>

      {supportsDisabledFiltering && (
        <>
          <DropdownItem divider tag="hr" />
          <DropdownItem header aria-hidden>Short URLs:</DropdownItem>
          <DropdownItem active={excludeMaxVisitsReached} onClick={onFilterClick('excludeMaxVisitsReached')}>
            Exclude with visits reached
          </DropdownItem>
          <DropdownItem active={excludePastValidUntil} onClick={onFilterClick('excludePastValidUntil')}>
            Exclude enabled in the past
          </DropdownItem>
        </>
      )}

      <DropdownItem divider tag="hr" />
      <DropdownItem
        disabled={
          selected.excludeBots === undefined
          && selected.excludeMaxVisitsReached === undefined
          && selected.excludePastValidUntil === undefined
        }
        onClick={() => onChange(
          { excludeBots: undefined, excludeMaxVisitsReached: undefined, excludePastValidUntil: undefined },
        )}
      >
        <i>Reset to defaults</i>
      </DropdownItem>
    </DropdownBtn>
  );
};
