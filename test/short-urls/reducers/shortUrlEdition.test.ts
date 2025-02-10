import { fromPartial } from '@total-typescript/shoehorn';
import type { ShlinkShortUrl } from '../../../src/api-contract';
import {
  editShortUrl as editShortUrlCreator,
  shortUrlEditionReducerCreator,
} from '../../../src/short-urls/reducers/shortUrlEdition';

describe('shortUrlEditionReducer', () => {
  const longUrl = 'https://shlink.io';
  const shortCode = 'abc123';
  const shortUrl = fromPartial<ShlinkShortUrl>({ longUrl, shortCode });
  const updateShortUrl = vi.fn().mockResolvedValue(shortUrl);
  const buildShlinkApiClient = vi.fn().mockReturnValue({ updateShortUrl });
  const editShortUrl = editShortUrlCreator(buildShlinkApiClient);
  const { reducer } = shortUrlEditionReducerCreator(editShortUrl);

  describe('reducer', () => {
    it('returns loading on EDIT_SHORT_URL_START', () => {
      expect(reducer(undefined, editShortUrl.pending('', fromPartial({})))).toEqual({
        saving: true,
        saved: false,
        error: false,
      });
    });

    it('returns error on EDIT_SHORT_URL_ERROR', () => {
      expect(reducer(undefined, editShortUrl.rejected(null, '', fromPartial({})))).toEqual({
        saving: false,
        saved: false,
        error: true,
      });
    });

    it('returns provided tags and shortCode on SHORT_URL_EDITED', () => {
      expect(reducer(undefined, editShortUrl.fulfilled(shortUrl, '', fromPartial({})))).toEqual({
        shortUrl,
        saving: false,
        saved: true,
        error: false,
      });
    });
  });

  describe('editShortUrl', () => {
    const dispatch = vi.fn();

    it.each([[undefined], [null], ['example.com']])('dispatches short URL on success', async (domain) => {
      await editShortUrl({ shortCode, domain, data: { longUrl } })(dispatch, vi.fn(), {});

      expect(buildShlinkApiClient).toHaveBeenCalledOnce();
      expect(updateShortUrl).toHaveBeenCalledOnce();
      expect(updateShortUrl).toHaveBeenCalledWith({ shortCode, domain }, { longUrl });
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenLastCalledWith(expect.objectContaining({ payload: shortUrl }));
    });
  });
});
