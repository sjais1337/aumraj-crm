import axios from 'axios';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const Tags = ({ initialTags, id }) => {
  const [tags, setTags] = useState(initialTags);
  const [newTag, setNewTag] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddTag = () => {
    if (newTag.trim() !== '') {
      let newTags; 

      if(tags[tags.length - 1].trim().toLowerCase() == 'others'){
        newTags = [...tags.splice(0, tags.length - 1), newTag.trim(), 'Others'];
      }else{
        newTags = [...tags, newTag.trim()];
      }
      setTags(newTags);
      updateData(newTags, 'add');
      setNewTag('');
      setIsAdding(false);
    }
  };

  async function updateData(value, type, tag?) {
    const res = await axios.post('/api/admin/updateSettings', {
      value: value,
      field: id
    });

    if(res.status == 200){
      if(type == 'add'){
        return toast.success('Successfully added ' + value[value.length-1] + ' to the list of ' + id + '!')
      }
      if(type == 'remove'){
        return toast.success('Successfully removed ' + tag + ' from the list of ' + id + '!')
      }
    }else{
      return toast.error('An unexpected error occurred. Please report to development.')
    }
  }
    

  const handleDeleteTag = (indexToRemove) => {
    const tag = tags[indexToRemove];
    const newTags = tags.filter((_, index) => index !== indexToRemove);
    try{
      updateData(newTags, 'remove', tag)
      setTags(newTags);
    }catch(err){
      toast.error('An unexpected error occurred.')
      throw new Error(err)
    }finally{

    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-14">
        {tags.map((tag, index) => (
          <div key={index} className="relative inline-flex items-center px-3 py-1 border rounded-full" style={{ borderColor: '#3C50E0', color: 'white', backgroundColor: '#3C50E0' }}>
            <span className="mr-2">{tag}</span>
            <span 
              onClick={() => handleDeleteTag(index)}
              className="flex items-center justify-center w-4 h-4 text-xs text-white rounded-full cursor-pointer"
              style={{ backgroundColor: 'white', color: '#3C50E0', fontWeight: 'bold' }}
            >
              &times;
            </span>
          </div>
        ))}
        {isAdding ? (
          <div className="bg-white relative inline-flex items-center px-3 py-1 border rounded-full" style={{ borderColor: '#3C50E0' }}>
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              className="outline-none border-none border-none focus:ring-0 text-black"
              placeholder="Enter new tag"
            />
            <span 
              onClick={handleAddTag}
              className="flex items-center justify-center w-4 h-4 text-xs text-white rounded-full cursor-pointer ml-2"
              style={{ backgroundColor: '#3C50E0' }}
            >
              ✓
            </span>
          </div>
        ) : (
          <div 
            className="bg-white relative inline-flex items-center px-3 py-1 border rounded-full cursor-pointer"
            style={{ borderColor: '#3C50E0', color: '#3C50E0' }} 
            onClick={() => setIsAdding(true)}
          >
            <span className="mr-2">Add</span>
            <span className="flex items-center justify-center w-4 h-4 text-xs text-white rounded-full" style={{ backgroundColor: '#3C50E0', color: 'white' }}>
              +
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tags;
