import { useDragAndDrop } from '@formkit/drag-and-drop/react';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useToggle } from '@shlinkio/shlink-frontend-kit';
import { Message, Result, SimpleCard } from '@shlinkio/shlink-frontend-kit/tailwind';
import type { ShlinkRedirectRuleData, ShlinkShortUrlIdentifier } from '@shlinkio/shlink-js-sdk/api-contract';
import type { FC, FormEvent } from 'react';
import { useCallback, useEffect } from 'react';
import { ExternalLink } from 'react-external-link';
import { Button, Card } from 'reactstrap';
import { ShlinkApiError } from '../common/ShlinkApiError';
import { useShortUrlIdentifier } from '../short-urls/helpers/hooks';
import type { ShortUrlsDetails } from '../short-urls/reducers/shortUrlsDetails';
import { GoBackButton } from '../utils/components/GoBackButton';
import { RedirectRuleCard } from './helpers/RedirectRuleCard';
import { RedirectRuleModal } from './helpers/RedirectRuleModal';
import type { SetShortUrlRedirectRules, SetShortUrlRedirectRulesInfo } from './reducers/setShortUrlRedirectRules';
import type { ShortUrlRedirectRules as RedirectRules } from './reducers/shortUrlRedirectRules';

type ShortUrlRedirectRulesProps = {
  shortUrlRedirectRules: RedirectRules;
  getShortUrlRedirectRules: (shortUrl: ShlinkShortUrlIdentifier) => void;

  shortUrlsDetails: ShortUrlsDetails;
  getShortUrlsDetails: (identifiers: ShlinkShortUrlIdentifier[]) => void;

  shortUrlRedirectRulesSaving: SetShortUrlRedirectRules;
  setShortUrlRedirectRules: (info: SetShortUrlRedirectRulesInfo) => void;

  resetSetRules: () => void;
};

export const ShortUrlRedirectRules: FC<ShortUrlRedirectRulesProps> = ({
  shortUrlRedirectRules,
  getShortUrlRedirectRules,
  getShortUrlsDetails,
  shortUrlsDetails,
  setShortUrlRedirectRules,
  shortUrlRedirectRulesSaving,
  resetSetRules,
}) => {
  const identifier = useShortUrlIdentifier();
  const { shortUrls } = shortUrlsDetails;
  const shortUrl = identifier && shortUrls?.get(identifier);
  const [rulesContainerRef, rules, setRules] = useDragAndDrop<HTMLDivElement, ShlinkRedirectRuleData>([], {
    dragHandle: '.drag-n-drop-handler',
    dropZoneClass: 'opacity-25',
  });

  const { saving, saved, errorData } = shortUrlRedirectRulesSaving;

  const [isModalOpen, toggleModal] = useToggle();

  const pushRule = useCallback((rule: ShlinkRedirectRuleData) => setRules((prev = []) => [...prev, rule]), [setRules]);
  const removeRule = useCallback((index: number) => setRules((prev = []) => {
    const copy = [...prev];
    copy.splice(index, 1);
    return copy;
  }), [setRules]);
  const updateRule = useCallback((index: number, rule: ShlinkRedirectRuleData) => setRules((prev = []) => {
    const copy = [...prev];
    copy[index] = rule;
    return copy;
  }), [setRules]);

  const moveRuleToNewPosition = useCallback((oldIndex: number, newIndex: number) => setRules((prev = []) => {
    if (!prev[newIndex]) {
      return prev;
    }

    const copy = [...prev];
    const temp = copy[newIndex];
    copy[newIndex] = copy[oldIndex];
    copy[oldIndex] = temp;

    return copy;
  }), [setRules]);
  const moveRuleUp = useCallback((index: number) => moveRuleToNewPosition(index, index - 1), [moveRuleToNewPosition]);
  const moveRuleDown = useCallback((index: number) => moveRuleToNewPosition(index, index + 1), [moveRuleToNewPosition]);

  const onSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    if (rules) {
      setShortUrlRedirectRules({
        shortUrl: identifier,
        data: { redirectRules: rules },
      });
    }
  }, [identifier, rules, setShortUrlRedirectRules]);

  useEffect(() => {
    getShortUrlRedirectRules(identifier);
    getShortUrlsDetails([identifier]);

    return resetSetRules;
  }, [getShortUrlRedirectRules, getShortUrlsDetails, identifier, resetSetRules]);

  useEffect(() => {
    // Initialize rules once loaded
    if (shortUrlRedirectRules.redirectRules) {
      setRules(shortUrlRedirectRules.redirectRules);
    }
  }, [setRules, shortUrlRedirectRules.redirectRules]);

  return (
    <div className="d-flex flex-column gap-3">
      <header>
        <Card body>
          <h2 className="d-sm-flex justify-content-between align-items-center mb-0">
            <GoBackButton />
            <div className="text-center flex-grow-1">
              {shortUrlsDetails.loading && <>Loading...</>}
              {!shortUrlsDetails.loading && (
                <small>Redirect rules for <ExternalLink href={shortUrl?.shortUrl ?? ''} /></small>
              )}
            </div>
          </h2>
          <hr />
          <div>
            <p className="mb-2">Configure dynamic conditions that will be checked at runtime.</p>
            If no conditions match, visitors will be redirected to: <ExternalLink href={shortUrlRedirectRules.defaultLongUrl ?? ''} />
          </div>
        </Card>
      </header>
      <div>
        <Button outline color="primary" onClick={toggleModal}>
          <FontAwesomeIcon icon={faPlus} className="me-1" /> Add rule
        </Button>
      </div>
      <form onSubmit={onSubmit}>
        {shortUrlRedirectRules.loading && <Message loading />}
        {rules.length === 0 && !shortUrlRedirectRules.loading && (
          <SimpleCard className="text-center"><i>This short URL has no dynamic redirect rules</i></SimpleCard>
        )}
        <div className="d-flex flex-column gap-2" ref={rulesContainerRef}>
          {rules.map((rule, index) => (
            <RedirectRuleCard
              key={`${rule.longUrl}_${index}`}
              redirectRule={rule}
              priority={index + 1}
              isLast={index === rules.length - 1}
              onDelete={() => removeRule(index)}
              onMoveUp={() => moveRuleUp(index)}
              onMoveDown={() => moveRuleDown(index)}
              onUpdate={(r) => updateRule(index, r)}
            />
          ))}
        </div>
        <div className="text-center mt-3">
          <Button outline color="primary" className="btn-sm-block" disabled={saving} data-testid="save-button">
            {saving ? 'Saving...' : 'Save rules'}
          </Button>
        </div>
      </form>
      {errorData && (
        <Result variant="error">
          <ShlinkApiError
            errorData={errorData}
            fallbackMessage="An error occurred while saving short URL redirect rules :("
          />
        </Result>
      )}
      {saved && <Result variant="success">Redirect rules properly saved.</Result>}
      <RedirectRuleModal isOpen={isModalOpen} toggle={toggleModal} onSave={pushRule} />
    </div>
  );
};
