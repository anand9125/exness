import React from 'react'

function Footer() {
  return (
   <div>
      <div>
        <div className='bg-[#141920] border-t border-[#2a3441] h-16 flex items-center justify-between'>
            <div className='flex space-x-6 border-b border-[#2a3441] p-4 w-full'>
                <div className='pl-3'>
                    <button className='cursor-pointer hover:underline underline-offset-11'>
                        OPEN
                    </button>
                </div>
                <div>
                    <button className='cursor-pointer hover:underline underline-offset-11'>
                        PENDING
                    </button>
                </div>
                <div className=''>
                <button className='cursor-pointer hover:underline underline-offset-11'>
                    CLOSED
                </button>
                </div>
            </div>
            <div>
                <div>

                </div>
            </div>
        </div>

      </div>
   </div>
  )
}

export default Footer