import PropTypes from 'prop-types';
export default function MediaItem({ item, index, onItemClick }) {
  const isVideo = item.mimeType.startsWith("video/");
  return (
    <div
      onClick={() => onItemClick(index)}
      className='group relative aspect-[4/3] overflow-hidden rounded-xl cursor-pointer'
    >
      {isVideo ? (
        <div className='relative w-full h-full'>
          <img
            src={`${item.baseUrl}=w800-h600`}
            alt={item.filename}
            className='w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110'
          />
        </div>
      ) : (
        <>
          <img
            src={`${item.baseUrl}=w800-h600`}
            alt={item.filename}
            className='w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110'
          />
        </>
      )}
    </div>
  );
};
MediaItem.propTypes = {
  item: PropTypes.shape({
    description: PropTypes.string,
    mimeType: PropTypes.string.isRequired,
    baseUrl: PropTypes.string.isRequired,
    filename: PropTypes.string.isRequired,
  }).isRequired,
  index: PropTypes.number.isRequired,
  onItemClick: PropTypes.func.isRequired,
};