import type { ExportableShortUrl } from '../../../src/short-urls/data';
import { ReportExporter } from '../../../src/utils/services/ReportExporter';
import type { NormalizedVisit } from '../../../src/visits/types';
import { windowMock } from '../../__mocks__/Window.mock';

describe('ReportExporter', () => {
  const jsonToCsv = vi.fn();
  let exporter: ReportExporter;

  beforeEach(() => {
    exporter = new ReportExporter(windowMock, jsonToCsv);
  });

  describe('exportVisits', () => {
    it('parses provided visits to CSV', () => {
      const visits: NormalizedVisit[] = [
        {
          browser: 'browser',
          city: 'city',
          country: 'country',
          region: 'region',
          date: 'date',
          latitude: 0,
          longitude: 0,
          os: 'os',
          referer: 'referer',
          potentialBot: false,
          userAgent: 'userAgent',
        },
      ];

      exporter.exportVisits('my_visits.csv', visits);

      expect(jsonToCsv).toHaveBeenCalledWith(visits);
    });

    it('skips execution when list of visits is empty', () => {
      exporter.exportVisits('my_visits.csv', []);

      expect(jsonToCsv).not.toHaveBeenCalled();
    });
  });

  describe('exportShortUrls', () => {
    it('parses provided short URLs to CSV', () => {
      const shortUrls: ExportableShortUrl[] = [
        {
          shortUrl: 'shortUrl',
          visits: 10,
          title: '',
          createdAt: '',
          longUrl: '',
          tags: '',
          shortCode: '',
        },
      ];

      exporter.exportShortUrls(shortUrls);

      expect(jsonToCsv).toHaveBeenCalledWith(shortUrls);
    });

    it('skips execution when list of visits is empty', () => {
      exporter.exportShortUrls([]);

      expect(jsonToCsv).not.toHaveBeenCalled();
    });
  });
});
