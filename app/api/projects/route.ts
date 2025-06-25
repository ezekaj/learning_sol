import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';

// Configure for dynamic API routes
export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For now, return static project data since we don't have a Project model yet
    // TODO: Create Project model in Prisma schema and implement real database queries
    
    const staticProjects = [
      {
        id: 'hello-world',
        title: 'Hello World Contract',
        description: 'Create your first smart contract that stores and retrieves a message',
        difficulty: 'beginner',
        category: 'utility',
        estimatedHours: 2,
        xpReward: 200,
        steps: [
          {
            id: 'step-1',
            title: 'Setup Contract Structure',
            description: 'Create the basic contract structure with state variables',
            instructions: [
              'Create a new contract called HelloWorld',
              'Add a string state variable to store a message',
              'Create a constructor to initialize the message',
              'Add the SPDX license identifier'
            ],
            code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HelloWorld {
    string public message;
    
    constructor() {
        message = "Hello, World!";
    }
}`,
            completed: false,
            estimatedTime: 30
          },
          {
            id: 'step-2',
            title: 'Add Message Functions',
            description: 'Implement functions to get and set the message',
            instructions: [
              'Add a function to get the current message',
              'Add a function to update the message',
              'Make sure the functions have proper visibility',
              'Add events for message updates'
            ],
            code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HelloWorld {
    string public message;
    
    event MessageUpdated(string newMessage, address updatedBy);
    
    constructor() {
        message = "Hello, World!";
    }
    
    function getMessage() public view returns (string memory) {
        return message;
    }
    
    function setMessage(string memory _newMessage) public {
        message = _newMessage;
        emit MessageUpdated(_newMessage, msg.sender);
    }
}`,
            completed: false,
            estimatedTime: 45
          },
          {
            id: 'step-3',
            title: 'Deploy and Test',
            description: 'Deploy your contract and test its functionality',
            instructions: [
              'Compile the contract and fix any errors',
              'Deploy the contract to a test network',
              'Test the getMessage function',
              'Test the setMessage function with different inputs',
              'Verify the events are emitted correctly'
            ],
            code: `// Test your deployed contract with these interactions:
// 1. Call getMessage() to see the initial message
// 2. Call setMessage("Hello, Blockchain!") to update
// 3. Call getMessage() again to verify the change
// 4. Check the transaction logs for the MessageUpdated event`,
            completed: false,
            estimatedTime: 60
          }
        ],
        currentStep: 0,
        completed: false,
        deployed: false
      },
      {
        id: 'token-contract',
        title: 'ERC-20 Token Contract',
        description: 'Build a complete ERC-20 token with minting and burning capabilities',
        difficulty: 'intermediate',
        category: 'defi',
        estimatedHours: 6,
        xpReward: 500,
        steps: [
          {
            id: 'token-step-1',
            title: 'Basic Token Structure',
            description: 'Implement the basic ERC-20 token interface',
            instructions: [
              'Import OpenZeppelin ERC20 contract',
              'Create your token contract inheriting from ERC20',
              'Set token name, symbol, and initial supply',
              'Implement constructor with initial minting'
            ],
            code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20 {
    constructor() ERC20("MyToken", "MTK") {
        _mint(msg.sender, 1000000 * 10**decimals());
    }
}`,
            completed: false,
            estimatedTime: 90
          }
        ],
        currentStep: 0,
        completed: false,
        deployed: false
      },
      {
        id: 'nft-collection',
        title: 'NFT Collection Contract',
        description: 'Create an ERC-721 NFT collection with metadata and minting functionality',
        difficulty: 'advanced',
        category: 'nft',
        estimatedHours: 8,
        xpReward: 750,
        steps: [
          {
            id: 'nft-step-1',
            title: 'NFT Contract Setup',
            description: 'Set up the basic NFT contract structure',
            instructions: [
              'Import OpenZeppelin ERC721 contracts',
              'Create NFT contract with enumerable extension',
              'Set collection name and symbol',
              'Implement basic minting functionality'
            ],
            code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyNFTCollection is ERC721, ERC721Enumerable, Ownable {
    uint256 private _nextTokenId;
    
    constructor() ERC721("MyNFTCollection", "MNC") {}
    
    function mint(address to) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
    }
}`,
            completed: false,
            estimatedTime: 120
          }
        ],
        currentStep: 0,
        completed: false,
        deployed: false
      }
    ];

    // TODO: Replace with real database queries when Project model is implemented
    // const projects = await prisma.project.findMany({
    //   include: {
    //     steps: true,
    //     userProgress: {
    //       where: { userId: session.user.id }
    //     }
    //   }
    // });

    return NextResponse.json({ projects: staticProjects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, projectId, stepId, code } = await request.json();

    switch (action) {
      case 'start_project':
        if (!projectId) {
          return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
        }

        // TODO: Implement project progress tracking in database
        console.log(`User ${session.user.id} started project ${projectId}`);

        return NextResponse.json({ 
          success: true, 
          message: 'Project started successfully' 
        });

      case 'complete_step':
        if (!projectId || !stepId) {
          return NextResponse.json({ error: 'Project ID and Step ID required' }, { status: 400 });
        }

        // TODO: Implement step completion tracking in database
        console.log(`User ${session.user.id} completed step ${stepId} in project ${projectId}`);

        // Award XP for step completion
        const stepXP = 50; // Base XP per step
        await prisma.userProfile.upsert({
          where: { userId: session.user.id },
          update: {
            totalXP: {
              increment: stepXP,
            },
          },
          create: {
            userId: session.user.id,
            totalXP: stepXP,
          },
        });

        return NextResponse.json({ 
          success: true, 
          xpAwarded: stepXP,
          message: 'Step completed successfully' 
        });

      case 'deploy_project':
        if (!projectId) {
          return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
        }

        // TODO: Implement actual contract deployment
        console.log(`User ${session.user.id} deployed project ${projectId}`);

        // Award bonus XP for deployment
        const deploymentXP = 200;
        await prisma.userProfile.upsert({
          where: { userId: session.user.id },
          update: {
            totalXP: {
              increment: deploymentXP,
            },
          },
          create: {
            userId: session.user.id,
            totalXP: deploymentXP,
          },
        });

        return NextResponse.json({ 
          success: true, 
          xpAwarded: deploymentXP,
          deploymentAddress: '0x' + Math.random().toString(16).substr(2, 40), // Mock address
          message: 'Project deployed successfully' 
        });

      case 'save_code':
        if (!projectId || !stepId || !code) {
          return NextResponse.json({ error: 'Project ID, Step ID, and code required' }, { status: 400 });
        }

        // TODO: Implement code saving in database
        console.log(`User ${session.user.id} saved code for step ${stepId} in project ${projectId}`);

        return NextResponse.json({ 
          success: true, 
          message: 'Code saved successfully' 
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing project action:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
