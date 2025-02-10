import { fromPartial } from '@total-typescript/shoehorn';
import type { ShlinkApiClient } from '../../../src/api-contract';
import { editTag as editTagCreator, tagEdited, tagEditReducerCreator } from '../../../src/tags/reducers/tagEdit';
import type { ColorGenerator } from '../../../src/utils/services/ColorGenerator';

describe('tagEditReducer', () => {
  const oldName = 'foo';
  const newName = 'bar';
  const color = '#ff0000';
  const editTagCall = vi.fn();
  const buildShlinkApiClient = () => fromPartial<ShlinkApiClient>({ editTag: editTagCall });
  const colorGenerator = fromPartial<ColorGenerator>({ setColorForKey: vi.fn() });
  const editTag = editTagCreator(buildShlinkApiClient, colorGenerator);
  const { reducer } = tagEditReducerCreator(editTag);

  describe('reducer', () => {
    it('returns loading on EDIT_TAG_START', () => {
      expect(reducer(undefined, editTag.pending('', fromPartial({})))).toEqual({
        editing: true,
        edited: false,
        error: false,
      });
    });

    it('returns error on EDIT_TAG_ERROR', () => {
      expect(reducer(undefined, editTag.rejected(null, '', fromPartial({})))).toEqual({
        editing: false,
        edited: false,
        error: true,
      });
    });

    it('returns tag names on EDIT_TAG', () => {
      expect(reducer(undefined, editTag.fulfilled({ oldName, newName, color }, '', fromPartial({})))).toEqual({
        editing: false,
        edited: true,
        error: false,
        oldName: 'foo',
        newName: 'bar',
      });
    });
  });

  describe('tagEdited', () => {
    it('returns action based on provided params', () => {
      const payload = { oldName: 'foo', newName: 'bar', color: '#ff0000' };
      expect(tagEdited(payload).payload).toEqual(payload);
    });
  });

  describe('editTag', () => {
    const dispatch = vi.fn();

    it('calls API on success', async () => {
      editTagCall.mockResolvedValue(undefined);

      await editTag({ oldName, newName, color })(dispatch, vi.fn(), {});

      expect(editTagCall).toHaveBeenCalledOnce();
      expect(editTagCall).toHaveBeenCalledWith({ oldName, newName });

      expect(colorGenerator.setColorForKey).toHaveBeenCalledOnce();
      expect(colorGenerator.setColorForKey).toHaveBeenCalledWith(newName, color);

      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenLastCalledWith(expect.objectContaining({
        payload: { oldName, newName, color },
      }));
    });
  });
});
