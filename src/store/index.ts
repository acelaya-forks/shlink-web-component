import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import { domainsListReducer } from '../domains/reducers/domainsList';
import { mercureInfoReducer } from '../mercure/reducers/mercureInfo';
import { shortUrlRedirectRulesSavingReducer } from '../redirect-rules/reducers/setShortUrlRedirectRules';
import { shortUrlRedirectRulesReducer } from '../redirect-rules/reducers/shortUrlRedirectRules';
import { shortUrlCreationReducer } from '../short-urls/reducers/shortUrlCreation';
import { shortUrlDeletionReducer } from '../short-urls/reducers/shortUrlDeletion';
import { shortUrlEditionReducer } from '../short-urls/reducers/shortUrlEdition';
import { shortUrlsDetailsReducer } from '../short-urls/reducers/shortUrlsDetails';
import { shortUrlsListReducer } from '../short-urls/reducers/shortUrlsList';
import { tagDeleteReducer } from '../tags/reducers/tagDelete';
import { tagEditReducer } from '../tags/reducers/tagEdit';
import { tagsListReducer } from '../tags/reducers/tagsList';
import { domainVisitsReducer } from '../visits/reducers/domainVisits';
import { nonOrphanVisitsReducer } from '../visits/reducers/nonOrphanVisits';
import { orphanVisitsReducer } from '../visits/reducers/orphanVisits';
import { orphanVisitsDeletionReducer } from '../visits/reducers/orphanVisitsDeletion';
import { shortUrlVisitsReducer } from '../visits/reducers/shortUrlVisits';
import { shortUrlVisitsDeletionReducer } from '../visits/reducers/shortUrlVisitsDeletion';
import { tagVisitsReducer } from '../visits/reducers/tagVisits';
import { visitsOverviewReducer } from '../visits/reducers/visitsOverview';
import { domainVisitsComparisonReducer } from '../visits/visits-comparison/reducers/domainVisitsComparison';
import { shortUrlVisitsComparisonReducer } from '../visits/visits-comparison/reducers/shortUrlVisitsComparison';
import { tagVisitsComparisonReducer } from '../visits/visits-comparison/reducers/tagVisitsComparison';

// @ts-expect-error process is actually available in vite
const isProduction = process.env.NODE_ENV === 'production';

export const setUpStore = (preloadedState?: any) => configureStore({
  devTools: !isProduction,
  reducer: combineReducers({
    mercureInfo: mercureInfoReducer,
    shortUrlsList: shortUrlsListReducer,
    shortUrlCreation: shortUrlCreationReducer,
    shortUrlDeletion: shortUrlDeletionReducer,
    shortUrlEdition: shortUrlEditionReducer,
    shortUrlsDetails: shortUrlsDetailsReducer,
    shortUrlVisits: shortUrlVisitsReducer,
    shortUrlVisitsDeletion: shortUrlVisitsDeletionReducer,
    shortUrlVisitsComparison: shortUrlVisitsComparisonReducer,
    tagVisits: tagVisitsReducer,
    tagVisitsComparison: tagVisitsComparisonReducer,
    domainVisits: domainVisitsReducer,
    domainVisitsComparison: domainVisitsComparisonReducer,
    orphanVisits: orphanVisitsReducer,
    orphanVisitsDeletion: orphanVisitsDeletionReducer,
    nonOrphanVisits: nonOrphanVisitsReducer,
    tagsList: tagsListReducer,
    tagDelete: tagDeleteReducer,
    tagEdit: tagEditReducer,
    domainsList: domainsListReducer,
    visitsOverview: visitsOverviewReducer,
    shortUrlRedirectRules: shortUrlRedirectRulesReducer,
    shortUrlRedirectRulesSaving: shortUrlRedirectRulesSavingReducer,
  }),
  preloadedState,
  middleware: (defaultMiddlewaresIncludingReduxThunk) => defaultMiddlewaresIncludingReduxThunk({
    // State is too big for these
    immutableCheck: false,
    serializableCheck: false,
  }),
});

export type StoreType = ReturnType<typeof setUpStore>;
export type AppDispatch = StoreType['dispatch'];
export type RootState = ReturnType<StoreType['getState']>;

// Typed versions of useDispatch() and useSelector()
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
