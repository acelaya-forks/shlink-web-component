import type { MercureInfo } from '../reducers/mercureInfo';

export const bindToMercureTopic = <T>(
  mercureInfo: MercureInfo & { version?: 'v0' | 'v1' },
  topics: string[],
  onMessage: (message: T) => void,
  onTokenExpired: () => void,
) => {
  const { status, version: mercureVersion = 'v0' } = mercureInfo;

  if (status !== 'loaded' || !mercureInfo.mercureHubUrl) {
    return undefined;
  }

  const onEventSourceMessage = ({ data }: MessageEvent) => onMessage(JSON.parse(data) as T);

  const subscriptions = topics.map((topic) => {
    const hubUrl = new URL(mercureInfo.mercureHubUrl);
    hubUrl.searchParams.append(mercureVersion === 'v0' ? 'topic' : 'match', topic);

    // Set the token in a cookie, then create the EventSource with credentials so that the cookie is forwarded
    const cookieName = mercureVersion === 'v0' ? 'mercureAuthorization' : 'mercure_access_token';
    document.cookie = `${cookieName}=${mercureInfo.token};domain=${hubUrl.hostname};path=${hubUrl.pathname};`;
    const es = new EventSource(hubUrl, { withCredentials: true });

    es.onmessage = onEventSourceMessage;
    // When an error occurs, invoke onTokenExpired just in case that was the issue
    // TODO Limit the amount of attempts
    es.onerror = onTokenExpired;

    return es;
  });

  return () => subscriptions.forEach((es) => es.close());
};
