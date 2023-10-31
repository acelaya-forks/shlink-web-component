import { faTag, faTags } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { OrderDir } from '@shlinkio/shlink-frontend-kit';
import { OrderingDropdown, SearchField } from '@shlinkio/shlink-frontend-kit';
import classNames from 'classnames';
import type { FC } from 'react';
import { useCallback } from 'react';
import { Button, InputGroup, Row, UncontrolledTooltip } from 'reactstrap';
import type { FCWithDeps } from '../container/utils';
import { componentFactory, useDependencies } from '../container/utils';
import type { TagsSelectorProps } from '../tags/helpers/TagsSelector';
import type { TagsList } from '../tags/reducers/tagsList';
import { DateRangeSelector } from '../utils/dates/DateRangeSelector';
import { formatIsoDate } from '../utils/dates/helpers/date';
import type { DateRange } from '../utils/dates/helpers/dateIntervals';
import { datesToDateRange } from '../utils/dates/helpers/dateIntervals';
import { useFeature } from '../utils/features';
import { useSetting } from '../utils/settings';
import type { ShortUrlsOrder, ShortUrlsOrderableFields } from './data';
import { SHORT_URLS_ORDERABLE_FIELDS } from './data';
import type { ExportShortUrlsBtnProps } from './helpers/ExportShortUrlsBtn';
import { useShortUrlsQuery } from './helpers/hooks';
import { ShortUrlsFilterDropdown } from './helpers/ShortUrlsFilterDropdown';
import './ShortUrlsFilteringBar.scss';

export type ShortUrlsFilteringBarProps = {
  order: ShortUrlsOrder;
  handleOrderBy: (orderField?: ShortUrlsOrderableFields, orderDir?: OrderDir) => void;
  className?: string;
  shortUrlsAmount?: number;
};

type ShortUrlsFilteringConnectProps = ShortUrlsFilteringBarProps & {
  tagsList: TagsList;
};

type ShortUrlsFilteringBarDeps = {
  ExportShortUrlsBtn: FC<ExportShortUrlsBtnProps>;
  TagsSelector: FC<TagsSelectorProps>;
};

const ShortUrlsFilteringBar: FCWithDeps<ShortUrlsFilteringConnectProps, ShortUrlsFilteringBarDeps> = (
  { className, shortUrlsAmount, order, handleOrderBy, tagsList },
) => {
  const { ExportShortUrlsBtn, TagsSelector } = useDependencies(ShortUrlsFilteringBar);
  const [filter, toFirstPage] = useShortUrlsQuery();
  const {
    search,
    tags,
    startDate,
    endDate,
    excludeBots,
    excludeMaxVisitsReached,
    excludePastValidUntil,
    tagsMode = 'any',
  } = filter;
  const supportsDisabledFiltering = useFeature('filterDisabledUrls');
  const visitsSettings = useSetting('visits');

  const setDates = useCallback(({ startDate: theStartDate, endDate: theEndDate }: DateRange) => toFirstPage({
    startDate: formatIsoDate(theStartDate) ?? undefined,
    endDate: formatIsoDate(theEndDate) ?? undefined,
  }), [toFirstPage]);
  const setSearch = useCallback(
    (searchTerm: string) => toFirstPage({ search: !searchTerm ? undefined : searchTerm }),
    [toFirstPage],
  );
  const changeTagSelection = useCallback((newTags: string[]) => toFirstPage({ tags: newTags }), [toFirstPage]);
  const toggleTagsMode = useCallback(
    () => toFirstPage({ tagsMode: tagsMode === 'any' ? 'all' : 'any' }),
    [tagsMode, toFirstPage],
  );

  return (
    <div className={classNames('short-urls-filtering-bar-container', className)}>
      <SearchField initialValue={search} onChange={setSearch} />

      <InputGroup className="mt-3">
        <TagsSelector
          immutable
          placeholder="With tags..."
          tags={tagsList.tags}
          selectedTags={tags}
          onChange={changeTagSelection}
        />
        {tags.length > 1 && (
          <>
            <Button outline color="secondary" onClick={toggleTagsMode} id="tagsModeBtn" aria-label="Change tags mode">
              <FontAwesomeIcon className="short-urls-filtering-bar__tags-icon" icon={tagsMode === 'all' ? faTags : faTag} />
            </Button>
            <UncontrolledTooltip target="tagsModeBtn" placement="left">
              {tagsMode === 'all' ? 'With all the tags.' : 'With any of the tags.'}
            </UncontrolledTooltip>
          </>
        )}
      </InputGroup>

      <Row className="flex-lg-row-reverse">
        <div className="col-lg-8 col-xl-6 mt-3">
          <div className="d-md-flex">
            <div className="flex-fill">
              <DateRangeSelector
                defaultText="All short URLs"
                initialDateRange={datesToDateRange(startDate, endDate)}
                onDatesChange={setDates}
              />
            </div>
            <ShortUrlsFilterDropdown
              className="ms-0 ms-md-2 mt-3 mt-md-0"
              selected={{
                excludeBots: excludeBots ?? visitsSettings?.excludeBots,
                excludeMaxVisitsReached,
                excludePastValidUntil,
              }}
              onChange={toFirstPage}
              supportsDisabledFiltering={supportsDisabledFiltering}
            />
          </div>
        </div>
        <div className="col-6 col-lg-4 col-xl-6 mt-3">
          <ExportShortUrlsBtn amount={shortUrlsAmount} />
        </div>
        <div className="col-6 d-lg-none mt-3">
          <OrderingDropdown
            prefixed={false}
            items={SHORT_URLS_ORDERABLE_FIELDS}
            order={order}
            onChange={handleOrderBy}
          />
        </div>
      </Row>
    </div>
  );
};

export const ShortUrlsFilteringBarFactory = componentFactory(
  ShortUrlsFilteringBar,
  ['ExportShortUrlsBtn', 'TagsSelector'],
);
